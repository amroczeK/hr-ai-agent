export const databaseConfig = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
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
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620',
    temperature: 0,
  },
};

export type DatabaseType = 'mongodb' | 'postgres';
