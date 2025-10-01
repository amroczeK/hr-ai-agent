import { Injectable, Logger } from '@nestjs/common';
import { DatabaseType } from '../config/database.config';
import { MongoDBAgentStrategy } from './strategies/mongodb-agent.strategy';
import { PostgresAgentStrategy } from './strategies/postgres-agent.strategy';
import {
  AgentResponse,
  AgentStrategy,
} from './interfaces/agent-strategy.interface';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private strategies: Map<DatabaseType, AgentStrategy>;

  constructor(
    private readonly mongoStrategy: MongoDBAgentStrategy,
    private readonly postgresStrategy: PostgresAgentStrategy,
  ) {
    // Initialize strategy map
    this.strategies = new Map<DatabaseType, AgentStrategy>([
      ['mongodb', this.mongoStrategy],
      ['postgres', this.postgresStrategy],
    ]);
  }

  /**
   * Execute the agent with the specified database strategy
   * @param databaseType - The database type to use (mongodb or postgres)
   * @param query - The user's query
   * @param threadId - The conversation thread ID
   * @returns The agent's response
   */
  async executeAgent(
    databaseType: DatabaseType,
    query: string,
    threadId: string,
  ): Promise<AgentResponse> {
    const strategy = this.strategies.get(databaseType);

    if (!strategy) {
      throw new Error(`Unsupported database type: ${databaseType}`);
    }

    this.logger.log(`Executing agent with ${databaseType} strategy`);
    return strategy.executeAgent(query, threadId);
  }
}
