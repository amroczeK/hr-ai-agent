import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AgentModule } from './agent/agent.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [DatabaseModule, AgentModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
