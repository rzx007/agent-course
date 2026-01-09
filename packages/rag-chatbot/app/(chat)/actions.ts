"use server";

import { generateText, type UIMessage } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";

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
    system: `根据用户的消息生成一个非常简短的对话标题（最多2-5个词）。
              规则：
              - 最多30个字符
              - 不要使用引号、冒号、井号或markdown格式
              - 只提取主题/意图，不要完整的句子
              - 如果消息是"hi"或"hello"之类的问候语，只需回复"新对话"
              - 保持简洁：使用"武汉天气"而不是"用户询问武汉市的天气"`,
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
