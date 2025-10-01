import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AgentModule } from './agent/agent.module';
import { ChatModule } from './chat/chat.module';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        OPENAI_API_KEY: Joi.string().required(),
        ANTHROPIC_API_KEY: Joi.string().required(),
        MONGODB_ATLAS_URI: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    AgentModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
