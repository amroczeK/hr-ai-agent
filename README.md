# HR AI Agent Backend + Frontend Chat Interface

An intelligent HR chatbot platform with a Next.js frontend and NestJS backend, designed to provide a simple OpenAI-style chat experience. The system supports both MongoDB Atlas with Vector Search and PostgreSQL with PGVector, enabling flexible and efficient data handling for AI-driven applications.

Built using LangChain, LangGraph, OpenAI for embeddings and Claude AI for conversation, the project demonstrates how to integrate AI agent frameworks with scalable web technologies.

This project extends the official MongoDB tutorial [Build a JavaScript AI Agent With LangGraph.js and MongoDB](https://youtu.be/qXDrWKVSx1w) by showcasing a full-stack implementation with additional features, architectural best practices, and multi-database support.

## 🚀 Features / Highlights

- **Clean Architecture**
- **AI Agent Development**: Implemented in NestJS with TypeScript, leveraging modular and extensible patterns
- **Modern Frontend**: Simple OpenAI-style chat interface built with Next.js, TypeScript, Shadcn UI, and TailwindCSS
- **Multi-Database Support**: Dual support for MongoDB Atlas + Vector Search and PostgreSQL + PGVector for structured and vector search capabilities
- **Intelligent Conversations**: Powered by Claude 4 Sonnet with LangGraph
- **Semantic Search**: Vector similarity search for employee information
- **Conversation Memory**: Persistent chat history using database-specific checkpointers

## Disclaimer

This is by no means a production-ready implementation, feel free to fork it and extend the development.

### TODOS
- [ ] Implement authentication, authorization and Role-Based Access Control (RBAC)
- [ ] Associate thread id's to the user
- [ ] Add unit and integration tests
- [ ] Implement Redis for caching purposes

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] MongoDB Atlas account (free tier works)
- [ ] API Keys:
  - [ ] Anthropic API key
  - [ ] OpenAI API key

## Start Up Steps
1. Follow the **Setup Steps** before proceeding
2. Start the frontend and backend using turbo from the project root folder
    ```bash
    npm run dev
    ```
3. Access the frontend interface via [http://localhost:3000/](http://localhost:3000/)
4. Access the backend API Swagger Docs via [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the template and fill in your values:

```bash
cd apps/backend
cp .env.template .env
```

Edit `.env` and update `MONGODB_URI`, `ANTHROPIC_API_KEY` and `OPENAI_API_KEY`:

```env
# For MongoDB Atlas
MONGODB_ATLAS_URI=mongodb://admin:admin@localhost:27017
MONGODB_DB_NAME=hr_database

# For PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=hr_database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Required API Keys
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
```

### 3. Set Up Your Database

The PostgreSQL database with PGVector extension is created as a container via [docker compose](./docker-compose.yml) later in this setup guide.

#### Setup MongoDB Atlas
MongoDB does not support Vector Search in local development, you have to create a MongoDB Atlas cluster hosted in their cloud environment, to use MongoDB as a Vector Database.

1. Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create database `hr_database` with collection `employees`
3. Create vector search index named `vector_index`
    1. Follow [YouTube tutorial](https://www.youtube.com/watch?v=qXDrWKVSx1w&t=765s)
    2. Use JSON configuration
        ```bash
        {
            "fields": [
                {
                "numDimensions": 1536,
                "path": "embedding",
                "similarity": "cosine",
                "type": "vector"
                }
            ]
        }
        ```
        >NOTE: OpenAI requires 1536 number of dimensions, [by default, the length of >the embedding vector is 1536](https://platform.openai.com/docs/guides/>embeddings#how-to-get-embeddings).
4. Whitelist your IP address (should be done automatically)

### 4. Start docker services
This will stand-up the containers for the PostgreSQL database, MongoDB database, and PGAdmin.

#### Start all services

```bash
docker-compose up -d
```

#### Stop all services

```bash
docker-compose down
```

### Stop and remove volumes (clean slate)

```bash
docker-compose down -v
```

#### Accessing Services

#### PostgreSQL

**Connection Details:**

- Host: `localhost` via local client OR `hr-postgres` via [PGAdmin container](http://localhost:5050/)
- Port: `5432`
- Database: `hr_database`
- Username: `postgres`
- Password: `postgres`

**Note**: When connecting from pgAdmin to PostgreSQL, use the container name `hr-postgres` as the hostname, NOT `localhost`. This is because pgAdmin runs inside Docker and needs to connect through the Docker network.

### MongoDB

**Connection Details:**

- Host: `localhost`
- Port: `27017`
- Database: `hr_database`
- Username: `admin`
- Password: `admin`
- Conneciton string: `mongodb://admin:admin@localhost:27017/`

### 5. Seed the databases
Run the [apps/backend/package.json scripts](./apps/backend/package.json).

#### PostgreSQL
```bash
cd apps/backend
npm run seed:postgres
```

#### MongoDB Atlas
```bash
cd apps/backend
npm run seed:mongodb
```

## Showcase
![Frontend Interface 1](./screenshots/fe-ui-1.png?raw=true "Frontend Interface 1")

![Frontend Interface 2](./screenshots/fe-ui-2.png?raw=true "Frontend Interface 2")

![PostgreSQL DB 1](./screenshots/pg-db-1.png?raw=true "PostgreSQL DB 1")

![PostgreSQL DB 2](./screenshots/pg-db-2.png?raw=true "PostgreSQL DB 2")

![MongoDB 1](./screenshots/mongodb-1.png?raw=true "MongoDB 1")

![MongoDB 2](./screenshots/mongodb-2.png?raw=true "MongoDB 2")