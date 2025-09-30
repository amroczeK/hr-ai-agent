import { BaseMessage } from '@langchain/core/messages';

export interface AgentResponse {
  content: string;
  messages: BaseMessage[];
}

export interface AgentStrategy {
  /**
   * Execute the agent with a given query and thread ID
   * @param query - The user's query
   * @param threadId - The conversation thread ID for maintaining context
   * @returns The agent's response
   */
  executeAgent(query: string, threadId: string): Promise<AgentResponse>;
}
