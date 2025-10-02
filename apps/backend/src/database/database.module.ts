import { Module, Global } from '@nestjs/common';
import { MongoDBProvider } from './providers/mongodb.provider';
import { PostgresProvider } from './providers/postgres.provider';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [MongoDBProvider, PostgresProvider],
  exports: [MongoDBProvider, PostgresProvider],
})
export class DatabaseModule {}
