import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
} from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createResource } from "@/lib/actions/resources";
import { findRelevantContent } from "@/lib/ai/embedding";
import z from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const deepseek = createDeepSeek({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "",
  });
  const result = streamText({
    model: deepseek.chat("mimo-v2-flash"),

    system: `你是一个乐于助人的助手。在回答任何问题之前，请先检查你的知识库。
    只使用工具调用中的信息来回答问题。
    如果在工具调用中没有找到相关信息，请回复"抱歉，我不知道。"`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      addResource: tool({
        description: `向你的知识库中添加一个资源。
          如果用户主动提供了一条随机的知识，无需确认即可使用此工具。`,
        inputSchema: z.object({
          content: z
            .string()

            .describe("要添加到知识库的内容或资源"),
        }),
        execute: async ({ content }) => {
          try {
            return await createResource({ content });
          } catch (error) {
            return { error: "Error adding resource" };
          }
        },
      }),
      getInformation: tool({

        description: `从你的知识库中获取信息以回答问题。`,
        inputSchema: z.object({
          question: z.string().describe("用户的问题"),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
