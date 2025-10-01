import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { MongoDBAgentStrategy } from './strategies/mongodb-agent.strategy';
import { PostgresAgentStrategy } from './strategies/postgres-agent.strategy';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AgentService, MongoDBAgentStrategy, PostgresAgentStrategy],
  exports: [AgentService],
})
export class AgentModule {}
