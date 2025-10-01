import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  Version,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Version('1')
  @ApiOperation({ summary: 'Chat with the HR AI Agent' })
  @ApiResponse({ status: 200, description: 'Chat response' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post()
  async chat(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      return await this.chatService.chat(chatRequest);
    } catch (error) {
      this.logger.error('Chat error:', error);
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Unknown error';

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to process chat request',
          error: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
