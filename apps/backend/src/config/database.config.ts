export default () => ({
  mongodb: {
    uri:
      process.env.MONGODB_ATLAS_URI || 'mongodb://admin:admin@localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'hr_database',
    collectionName: 'employees',
    vectorIndexName: 'vector_index',
  },
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'hr_database',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    tableName: 'employees',
  },
  llm: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    temperature: 0,
  },
});

export type DatabaseType = 'mongodb' | 'postgres';

export interface DatabaseConfig {
  mongodb: {
    uri: string;
    dbName: string;
    collectionName: string;
    vectorIndexName: string;
  };
  postgres: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    tableName: string;
  };
  llm: {
    anthropicApiKey: string;
    openaiApiKey: string;
    model: string;
    temperature: number;
  };
}
