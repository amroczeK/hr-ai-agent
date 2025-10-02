import { Injectable, Logger } from '@nestjs/common';
import { ChatAnthropic } from '@langchain/anthropic';
import { OpenAIEmbeddings } from '@langchain/openai';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { StateGraph, Annotation } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import {
  AgentStrategy,
  AgentResponse,
} from '../interfaces/agent-strategy.interface';
import { VectorStoreConfig } from '../interfaces/vector-store-config.interface';
import { createEmployeeLookupTool } from '../tools/employee-lookup.tool';
import { DatabaseConfig } from '../../config/database.config';
import { PostgresProvider } from '../../database/providers/postgres.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostgresAgentStrategy implements AgentStrategy {
  private readonly logger = new Logger(PostgresAgentStrategy.name);
  private postgresConfig: DatabaseConfig['postgres'];
  private llmConfig: DatabaseConfig['llm'];

  constructor(
    private readonly postgresProvider: PostgresProvider,
    private readonly configService: ConfigService<DatabaseConfig>,
  ) {
    const postgresConfig =
      this.configService.get<DatabaseConfig['postgres']>('postgres');

    if (!postgresConfig) {
      throw new Error('Postgres configuration not found');
    }
    this.postgresConfig = postgresConfig;

    const llmConfig = this.configService.get<DatabaseConfig['llm']>('llm');

    if (!llmConfig) {
      throw new Error('LLM configuration not found');
    }
    this.llmConfig = llmConfig;
  }

  async executeAgent(query: string, threadId: string): Promise<AgentResponse> {
    // Get the connection pool from the provider
    const pool = this.postgresProvider.getPool();

    // Define the graph state
    const GraphState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
    });

    // Create vector store configuration
    const vectorStoreConfig: VectorStoreConfig = {
      async similaritySearch(query: string, k: number): Promise<string> {
        const vectorStore = await PGVectorStore.initialize(
          new OpenAIEmbeddings(),
          {
            pool: pool,
            tableName: (this as PostgresAgentStrategy).postgresConfig.tableName,
            columns: {
              idColumnName: 'id',
              vectorColumnName: 'embedding',
              contentColumnName: 'embedding_text',
              metadataColumnName: 'metadata',
            },
          },
        );

        const results = await vectorStore.similaritySearchWithScore(query, k);
        return JSON.stringify(results);
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

    // Initialize Postgres checkpointer for conversation memory using the existing pool
    const checkpointer = new PostgresSaver(pool);
    await checkpointer.setup();

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
