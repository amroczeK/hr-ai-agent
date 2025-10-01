import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AgentService } from '../agent/agent.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  constructor(private readonly agentService: AgentService) {}

  async chat(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    // Generate thread ID if not provided (for new conversations)
    const threadId = chatRequest.threadId || uuidv4();

    // Execute the agent
    const agentResponse = await this.agentService.executeAgent(
      chatRequest.databaseType,
      chatRequest.query,
      threadId,
    );

    return {
      content: agentResponse.content,
      threadId,
      databaseType: chatRequest.databaseType,
      timestamp: new Date().toISOString(),
    };
  }
}
