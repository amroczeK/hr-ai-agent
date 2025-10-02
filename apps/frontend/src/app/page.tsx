"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { ChatInput } from "@/components/chat/chat-input";
import {
  ChatThread,
  DatabaseType,
  Message,
  ChatRequest,
  ChatResponse,
} from "@/types/chat";

export default function Home() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [databaseType, setDatabaseType] = useState<DatabaseType>("postgres");

  const currentThread = threads.find((t) => t.id === currentThreadId);

  const generateThreadTitle = (query: string): string => {
    return query.length > 50 ? query.substring(0, 50) + "..." : query;
  };

  const handleNewChat = useCallback(() => {
    setCurrentThreadId(null);
    setDatabaseType("postgres");
  }, []);

  const handleThreadSelect = useCallback(
    (threadId: string) => {
      const thread = threads.find((t) => t.id === threadId);
      if (thread) {
        setCurrentThreadId(threadId);
        setDatabaseType(thread.databaseType);
      }
    },
    [threads]
  );

  const handleSubmit = async (message: string, dbType: DatabaseType) => {
    setIsLoading(true);

    // Create user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    // If no current thread, create a new one
    let threadId = currentThreadId;
    let updatedThreads = [...threads];

    if (!threadId) {
      const newThread: ChatThread = {
        id: crypto.randomUUID(),
        title: generateThreadTitle(message),
        databaseType: dbType,
        messages: [userMessage],
        createdAt: new Date().toISOString(),
      };
      threadId = newThread.id;
      updatedThreads = [newThread, ...updatedThreads];
      setCurrentThreadId(threadId);
      setThreads(updatedThreads);
    } else {
      // Add message to existing thread
      updatedThreads = updatedThreads.map((thread) =>
        thread.id === threadId
          ? { ...thread, messages: [...thread.messages, userMessage] }
          : thread
      );
      setThreads(updatedThreads);
    }

    try {
      // Make API request
      const requestBody: ChatRequest = {
        query: message,
        databaseType: dbType,
        threadId: threadId,
      };

      const response = await fetch("http://localhost:3001/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data: ChatResponse = await response.json();

      // Create assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        timestamp: data.timestamp,
      };

      // Add assistant message to thread
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, assistantMessage] }
            : thread
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);

      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };

      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === threadId
            ? { ...thread, messages: [...thread.messages, errorMessage] }
            : thread
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        threads={threads}
        currentThreadId={currentThreadId}
        onThreadSelect={handleThreadSelect}
        onNewChat={handleNewChat}
      />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <ChatArea
          messages={currentThread?.messages || []}
          isLoading={isLoading}
        />

        <ChatInput
          onSubmit={handleSubmit}
          disabled={isLoading}
          databaseType={databaseType}
          onDatabaseTypeChange={setDatabaseType}
        />
      </div>
    </div>
  );
}
