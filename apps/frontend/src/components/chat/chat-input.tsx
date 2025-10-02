"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatabaseType } from "@/types/chat";

interface ChatInputProps {
  onSubmit: (message: string, databaseType: DatabaseType) => void;
  disabled: boolean;
  databaseType: DatabaseType;
  onDatabaseTypeChange: (type: DatabaseType) => void;
}

export function ChatInput({
  onSubmit,
  disabled,
  databaseType,
  onDatabaseTypeChange,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input.trim(), databaseType);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-3">
        <div className="flex items-center gap-3">
          <Select
            value={databaseType}
            onValueChange={(value) =>
              onDatabaseTypeChange(value as DatabaseType)
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select database" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="postgres">PostgreSQL</SelectItem>
              <SelectItem value="mongodb">MongoDB Atlas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about employees..."
            disabled={disabled}
            className="flex-1"
          />
          <Button type="submit" disabled={disabled || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
