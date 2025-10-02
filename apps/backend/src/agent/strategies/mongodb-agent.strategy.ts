import { Injectable, Logger } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { StateGraph, Annotation } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import {
  AgentStrategy,
  AgentResponse,
} from '../interfaces/agent-strategy.interface';
import { VectorStoreConfig } from '../interfaces/vector-store-config.interface';
import { createEmployeeLookupTool } from '../tools/employee-lookup.tool';
import { DatabaseConfig } from '../../config/database.config';
import { MongoDBProvider } from '../../database/providers/mongodb.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoDBAgentStrategy implements AgentStrategy {
  private readonly logger = new Logger(MongoDBAgentStrategy.name);
  private mongodbConfig: DatabaseConfig['mongodb'];
  private llmConfig: DatabaseConfig['llm'];

  constructor(
    private readonly mongoProvider: MongoDBProvider,
    private readonly configService: ConfigService<DatabaseConfig>,
  ) {
    const mongodbConfig =
      this.configService.get<DatabaseConfig['mongodb']>('mongodb');

    if (!mongodbConfig) {
      throw new Error('MongoDB configuration not found');
    }
    this.mongodbConfig = mongodbConfig;

    const llmConfig = this.configService.get<DatabaseConfig['llm']>('llm');

    if (!llmConfig) {
      throw new Error('LLM configuration not found');
    }
    this.llmConfig = llmConfig;
  }

  async executeAgent(query: string, threadId: string): Promise<AgentResponse> {
    const client = this.mongoProvider.getClient();
    const db = this.mongoProvider.getDb();
    const collection = db.collection(this.mongodbConfig.collectionName);

    // Define the graph state
    const GraphState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
    });

    // Create vector store configuration
    const vectorStoreConfig: VectorStoreConfig = {
      async similaritySearch(query: string, k: number): Promise<string> {
        const vectorStore = new MongoDBAtlasVectorSearch(
          new OpenAIEmbeddings(),
          {
            collection: collection,
            indexName: (this as MongoDBAgentStrategy).mongodbConfig
              .vectorIndexName,
            textKey: 'embedding_text',
            embeddingKey: 'embedding',
          },
        );

        const result = await vectorStore.similaritySearchWithScore(query, k);
        return JSON.stringify(result);
      },
    };

    // Create tools
    const employeeLookupTool = createEmployeeLookupTool(
      vectorStoreConfig,
      this.logger,
    );
    const tools = [employeeLookupTool];

    // Create tool node
    const toolNode = new ToolNode<typeof GraphState.State>(tools);

    // Create model with tools
    const model = new ChatAnthropic({
      model: this.llmConfig.model,
      temperature: this.llmConfig.temperature,
      apiKey: this.llmConfig.anthropicApiKey,
    }).bindTools(tools);

    // Define routing function
    function shouldContinue(state: typeof GraphState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;

      if (lastMessage.tool_calls?.length) {
        return 'tools';
      }
      return '__end__';
    }

    // Define model calling function
    async function callModel(state: typeof GraphState.State) {
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          `You are a helpful HR AI assistant with access to an employee database. 
Use the provided tools to search for employee information and answer questions accurately.
If you need to look up employee information, use the employee_lookup tool.
Always provide helpful, accurate responses based on the data you find.
You have access to the following tools: {tool_names}.
Current time: {time}.`,
        ],
        new MessagesPlaceholder('messages'),
      ]);

      const formattedPrompt = await prompt.formatMessages({
        time: new Date().toISOString(),
        tool_names: tools.map((tool) => tool.name).join(', '),
        messages: state.messages,
      });

      const result = await model.invoke(formattedPrompt);
      return { messages: [result] };
    }

    // Build the graph
    const workflow = new StateGraph(GraphState)
      .addNode('agent', callModel)
      .addNode('tools', toolNode)
      .addEdge('__start__', 'agent')
      .addConditionalEdges('agent', shouldContinue)
      .addEdge('tools', 'agent');

    // Initialize MongoDB checkpointer for conversation memory
    const checkpointer = new MongoDBSaver({
      client,
      dbName: this.mongodbConfig.dbName,
    });

    // Compile the graph
    const app = workflow.compile({ checkpointer });

    // Execute the agent
    const finalState = await app.invoke(
      {
        messages: [new HumanMessage(query)],
      },
      {
        recursionLimit: 15,
        configurable: { thread_id: threadId },
      },
    );

    const lastMessage = finalState.messages[finalState.messages.length - 1];

    return {
      content: lastMessage.content as string,
      messages: finalState.messages,
    };
  }
}
