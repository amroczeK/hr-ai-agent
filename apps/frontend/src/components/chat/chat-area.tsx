"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import { ChatMessage } from "./message";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <h2 className="text-2xl font-semibold mb-2">HR AI Agent</h2>
          <p>Ask a question about employees to get started</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pb-24">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="max-w-[80%] rounded-lg bg-muted px-4 py-3">
              <div className="flex space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/40"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}
