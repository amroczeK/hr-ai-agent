import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import type { DatabaseType } from '../../config/database.config';
import { ApiProperty } from '@nestjs/swagger';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The query to search the database',
    example: 'Find all senior engineers in the San Francisco office',
    default: 'Find all senior engineers in the San Francisco office',
  })
  query: string;

  @IsEnum(['mongodb', 'postgres'])
  @IsNotEmpty()
  @ApiProperty({
    description: 'The database type to query',
    enum: ['mongodb', 'postgres'],
    example: 'postgres',
    default: 'postgres',
  })
  databaseType: DatabaseType;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The thread ID to continue the conversation',
    example: '550e8400-e29b-41d4-a716-446655440000',
    default: '550e8400-e29b-41d4-a716-446655440000',
  })
  threadId?: string;
}
