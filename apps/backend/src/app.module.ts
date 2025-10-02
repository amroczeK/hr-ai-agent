import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AgentModule } from './agent/agent.module';
import { ChatModule } from './chat/chat.module';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        OPENAI_API_KEY: Joi.string().required(),
        ANTHROPIC_API_KEY: Joi.string().required(),
        MONGODB_URI: Joi.string().required(),
      }),
      load: [configuration],
    }),
    DatabaseModule,
    AgentModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
