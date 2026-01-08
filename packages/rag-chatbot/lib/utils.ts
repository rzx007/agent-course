import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DBMessage } from "@/lib/db/schema";
import { ChatMessage, CustomUIDataTypes } from "@/lib/types";
import { UIMessagePart, UITools } from "ai";
import { formatISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    parts: message.parts as UIMessagePart<CustomUIDataTypes, UITools>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }));
}
