import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { databaseConfig } from '../../config/database.config';

@Injectable()
export class PostgresProvider implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  async onModuleInit() {
    try {
      this.pool = new Pool({
        host: databaseConfig.postgres.host,
        port: databaseConfig.postgres.port,
        database: databaseConfig.postgres.database,
        user: databaseConfig.postgres.user,
        password: databaseConfig.postgres.password,
      });

      const client = await this.pool.connect();
      client.release();
      console.log('PostgreSQL connected successfully');
    } catch (error) {
      console.error('PostgreSQL connection error:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      console.log('PostgreSQL connection closed');
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
