import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ description: 'The content of the response' })
  content: string;

  @ApiProperty({ description: 'The thread ID to continue the conversation' })
  threadId: string;

  @ApiProperty({ description: 'The database type to query' })
  databaseType: string;

  @ApiProperty({ description: 'The timestamp of the response' })
  timestamp: string;
}
