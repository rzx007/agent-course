import {
  streamText,
  UIMessage,
  convertToModelMessages,
  StreamTextResult,
  ModelMessage,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
export async function POST(request: Request) {
  const {
    messages,
    model,
    webSearch,
  }: { messages: UIMessage[]; model: string; webSearch: boolean } =
    await request.json();

  const openai = createDeepSeek({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "",
    // 自定义 fetch 实现,mimo-v2-flash有些独有的参数
    fetch: async (url, options) => {
      // 1. 解析原始请求体
      const body = JSON.parse(options?.body as string);

      // 2. 注入自定义参数
      const modifiedBody = {
        ...body,
        thinking: { type: "enabled" },
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
  const response = await streamText({
    model: openai.chat("mimo-v2-flash"),
    system: "你是rzx训练出来的大语言模型",
    messages: await convertToModelMessages(messages),
    // providerOptions: {
    //   mimo: {
    //     thinking: { type: "enabled" },
    //   },
    // },
  });
  // 将来源和推理信息发送给客户端
  return response.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
