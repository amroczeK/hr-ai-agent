# HR AI Agent Backend

A production-ready NestJS backend for an intelligent HR chatbot that supports both MongoDB Atlas and PostgreSQL with PGVector. Built with LangChain, LangGraph, and Claude AI.

## 🚀 Features

- **Multi-Database Support**: Choose between MongoDB Atlas or PostgreSQL at runtime
- **Intelligent Conversations**: Powered by Claude 4 Sonnet with LangGraph
- **Semantic Search**: Vector similarity search for employee information
- **Conversation Memory**: Persistent chat history using database-specific checkpointers


## Description

Built with [NestJS](https://github.com/nestjs/nest) framework. Access the backend swagger docs via [http://localhost:3001/api/docs](http://localhost:3001/api/docs).

## Prerequisites
- OpenAI and Anthropic API keys
- Populate `.env`, refer to `.env.example`
- Docker

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
