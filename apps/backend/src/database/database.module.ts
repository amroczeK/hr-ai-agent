import { Module, Global } from '@nestjs/common';
import { MongoDBProvider } from './providers/mongodb.provider';
import { PostgresProvider } from './providers/postgres.provider';

@Global()
@Module({
  providers: [MongoDBProvider, PostgresProvider],
  exports: [MongoDBProvider, PostgresProvider],
})
export class DatabaseModule {}
