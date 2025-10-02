import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { DatabaseConfig } from '../../config/database.config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostgresProvider implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresProvider.name);
  private pool: Pool;
  private config: DatabaseConfig['postgres'];

  constructor(private readonly configService: ConfigService<DatabaseConfig>) {
    const config =
      this.configService.get<DatabaseConfig['postgres']>('postgres');

    if (!config) {
      throw new Error('Postgres configuration not found');
    }
    this.config = config;
  }

  async onModuleInit() {
    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
      });

      const client = await this.pool.connect();
      client.release();
      this.logger.log('PostgreSQL connected successfully');
    } catch (error) {
      this.logger.error('PostgreSQL connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('PostgreSQL connection closed');
    }
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not initialized');
    }
    return this.pool;
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }
}
