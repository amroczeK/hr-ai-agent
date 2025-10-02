"use client";

import { ChatThread } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  threads: ChatThread[];
  currentThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
}

export function Sidebar({
  threads,
  currentThreadId,
  onThreadSelect,
  onNewChat,
}: SidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="p-4">
        <Button onClick={onNewChat} className="w-full" variant="default">
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onThreadSelect(thread.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent ${
                currentThreadId === thread.id ? "bg-sidebar-accent" : ""
              }`}
            >
              <div className="truncate font-medium">{thread.title}</div>
              <div className="truncate text-xs text-muted-foreground">
                {thread.databaseType === "mongodb"
                  ? "MongoDB Atlas"
                  : "PostgreSQL"}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
