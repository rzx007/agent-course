import type { UIMessage, UITools } from "ai";
import { z } from "zod";
export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: string;
  appendMessage: string;
  id: string;
  title: string;
  kind: "image" | "sheet" | "code" | "text";
  clear: null;
  finish: null;
  "chat-title": string;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  UITools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
