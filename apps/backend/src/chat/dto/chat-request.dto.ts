import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import type { DatabaseType } from '../../config/database.config';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsEnum(['mongodb', 'postgres'])
  @IsNotEmpty()
  databaseType: DatabaseType;

  @IsString()
  @IsOptional()
  threadId?: string;
}
