import { Module } from '@nestjs/common';
import { MongoDBAgentStrategy } from './strategies/mongodb-agent.strategy';
import { PostgresAgentStrategy } from './strategies/postgres-agent.strategy';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [MongoDBAgentStrategy, PostgresAgentStrategy],
  exports: [],
})
export class AgentModule {}
