"use server";

import { generateText, type UIMessage } from "ai";
import { titlePrompt } from "@/lib/ai/prompts";
import { getModel } from "@/lib/ai/provider";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";

export async function generateTitleFromUserMessage({
  message,
  model,
}: {
  message: UIMessage;
  model: string;
}) {
  const { text: title } = await generateText({
    model: getModel(model ?? DEFAULT_CHAT_MODEL),
    system: titlePrompt,
    prompt: await getTextFromMessage(message),
  });

  return title;
}

export async function getTextFromMessage(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");
}
