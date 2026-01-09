"use server";

import { generateText, type UIMessage } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { titlePrompt } from "@/lib/ai/prompts";

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const deepseek = createDeepSeek({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "",
  });
  const { text: title } = await generateText({
    model: deepseek.chat("mimo-v2-flash"),
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
