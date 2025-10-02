import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { MongoDBAgentStrategy } from './strategies/mongodb-agent.strategy';
import { PostgresAgentStrategy } from './strategies/postgres-agent.strategy';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DatabaseModule, ConfigModule],
  providers: [AgentService, MongoDBAgentStrategy, PostgresAgentStrategy],
  exports: [AgentService],
})
export class AgentModule {}
