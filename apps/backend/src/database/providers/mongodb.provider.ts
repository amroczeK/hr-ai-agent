import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import { DatabaseConfig } from '../../config/database.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoDBProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoDBProvider.name);
  private client: MongoClient;
  private db: Db;
  private config: DatabaseConfig['mongodb'];

  constructor(private readonly configService: ConfigService<DatabaseConfig>) {
    const config = this.configService.get<DatabaseConfig['mongodb']>('mongodb');

    if (!config) {
      throw new Error('MongoDB configuration not found');
    }
    this.config = config;
  }

  async onModuleInit() {
    try {
      this.client = new MongoClient(this.config.uri);
      await this.client.connect();
      this.db = this.client.db(this.config.dbName);
      this.logger.log('MongoDB connected successfully');
    } catch (error) {
      this.logger.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      this.logger.log('MongoDB connection closed');
    }
  }

  getClient(): MongoClient {
    if (!this.client) {
      throw new Error('MongoDB client not initialized');
    }
    return this.client;
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('MongoDB database not initialized');
    }
    return this.db;
  }

  getCollection(collectionName: string): Collection {
    return this.db.collection(collectionName);
  }
}
