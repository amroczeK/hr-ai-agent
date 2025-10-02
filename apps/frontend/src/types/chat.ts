export type DatabaseType = "mongodb" | "postgres";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  title: string;
  databaseType: DatabaseType;
  messages: Message[];
  createdAt: string;
}

export interface ChatRequest {
  query: string;
  databaseType: DatabaseType;
  threadId?: string;
}

export interface ChatResponse {
  content: string;
  threadId: string;
  databaseType: string;
  timestamp: string;
}
