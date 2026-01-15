import {
  createUIMessageStream,
  JsonToSseTransformStream,
  streamText,
  convertToModelMessages,
  stepCountIs,
  smoothStream,
} from "ai";
import { after } from "next/server";
import {
  createResumableStreamContext,
  ResumableStreamContext,
} from "resumable-stream";
import { createDeepSeek } from "@ai-sdk/deepseek";
import {
  saveChat,
  saveMessages,
  createStreamId,
  getChatById,
  updateChatTitleById,
  updateMessage,
} from "@/lib/db/queries";
import { generateTitleFromUserMessage } from "@/app/(chat)/actions";
import { generateUUID } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { getHotNews } from "@/lib/ai/tools/get-hotnews";
import { getDailyNewsImage } from "@/lib/ai/tools/get-daily-news-image";
import { getRandomImage } from "@/lib/ai/tools/get-random-image";
import { systemPrompt } from "@/lib/ai/prompts";

// 初始化可恢复流上下文
let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error("rzx007", error);
      }
    }
  }
  return globalStreamContext;
}

export async function POST(request: Request) {
  const { id, messages, model, webSearch } = await request.json();
  const lastMessage = messages.at(-1);
  // 1. 获取当前用户会话
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. 立即创建/检查聊天会话
  const chat = await getChatById({ id });
  if (!chat) {
    await saveChat({ id, title: "New Chat", userId: session.user.id });
    // 生成标题
    const title = await generateTitleFromUserMessage({
      message: lastMessage,
    });
    updateChatTitleById({ chatId: id, title });
  }
  // 保存用户消息（需要生成新的 UUID）
  await saveMessages({
    messages: [
      {
        id: generateUUID(), // 生成符合数据库要求的 UUID
        chatId: id,
        role: lastMessage.role,
        parts: lastMessage.parts,
        attachments: [],
        createdAt: new Date(),
      },
    ],
  });

  // 2. 生成流 ID 并持久化，供后续 GET 接口查询
  const streamId = generateUUID();
  await createStreamId({ streamId, chatId: id });

  // 3. 创建使用手动流容器的 DeepSeek 客户端
  const deepseek = createDeepSeek({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "",
    // 自定义 fetch 实现,mimo-v2-flash有些独有的参数
    fetch: async (url, options) => {
      // 1. 解析原始请求体
      const body = JSON.parse(options?.body as string);

      // 2. 注入自定义参数
      const modifiedBody = {
        ...body,
        // thinking: { type: "enabled" }, // 启用思考过程
      };
      const response = await fetch(url, {
        ...options,
        body: JSON.stringify(modifiedBody),
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      // console.log(await response.text());
      return response;
    },
  });
  const stream = createUIMessageStream({
    execute: async ({ writer: dataStream }) => {
      try {
        dataStream.write({
          type: "data-chat-title",
          data: "",
          transient: true,
        });
        const result = streamText({
          model: deepseek.chat("mimo-v2-flash"),
          system: systemPrompt,
          experimental_transform: smoothStream(),
          messages: await convertToModelMessages(messages),
          tools: { getWeather, getHotNews, getDailyNewsImage, getRandomImage },
          stopWhen: [stepCountIs(5)],
          onError: (error) => {
            console.log("🚀 ~ POST ~ error:", JSON.stringify(error));
            dataStream.write({
              type: "error",
              errorText:
                error instanceof Error ? error.message : "Unknown error",
            });
          },
        });

        // 【核心】即使客户端刷新/关闭，服务器也要悄悄把话写完存进 Redis
        result.consumeStream();
        // 将 AI SDK 的原始流合并进我们的数据流
        dataStream.merge(
          result.toUIMessageStream({
            originalMessages: messages,
            // 自定义消息元数据
            messageMetadata(options) {
              const { part } = options;
              if (part.type === "finish") {
                return {
                  totalTokens: part.totalUsage.totalTokens,
                };
              }
            },
          })
        );
      } catch (error) {
        console.log("🚀 ~ POST1 ~ error:", error);
        // 写入错误信息到流中
        dataStream.write({
          type: "error",
          errorText: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    onFinish: async ({ messages: finishedMessages }) => {
      // 3. 结束后持久化到数据库
      for (const finishedMsg of finishedMessages) {
        const existingMsg = messages.find(
          (m: { id: string }) => m.id === finishedMsg.id
        );
        if (existingMsg) {
          // 更新已存在的消息部分（工具状态已改变，工具不同状态的消息id是一样的，只存储最终结果）
          await updateMessage({
            id: finishedMsg.id,
            parts: finishedMsg.parts,
          });
        } else {
          await saveMessages({
            messages: [
              {
                id: finishedMsg.id,
                role: finishedMsg.role,
                parts: finishedMsg.parts,
                createdAt: new Date(),
                attachments: [],
                chatId: id,
              },
            ],
          });
        }
      }
    },
  });

  // 4. 将流包裹在可恢复上下文中并返回

  const streamContext = getStreamContext();

  if (streamContext) {
    try {
      const resumableStream = await streamContext.resumableStream(
        streamId,
        () => stream.pipeThrough(new JsonToSseTransformStream())
      );
      if (resumableStream) {
        return new Response(resumableStream);
      }
    } catch (error) {
      console.error("Failed to create resumable stream:", error);
      // 如果是 Redis 连接错误，记录日志但不阻塞请求
      if (
        error instanceof Error &&
        JSON.stringify(error).includes("ECONNREFUSED")
      ) {
        console.warn(
          " > Redis connection refused - streaming without resume capability"
        );
      }
    }
  }

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
}
