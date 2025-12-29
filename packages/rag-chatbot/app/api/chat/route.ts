import { streamText, UIMessage, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "",
  });
  console.log(process.env.OPENAI_BASE_URL);
  const response = await streamText({
    model: openai.chat("mimo-v2-flash"),
    system: "你是rzx训练出来的大语言模型",
    messages: await convertToModelMessages(messages),
    providerOptions: {
      openai: {
        thinking: { type: "enabled" },
      },
    },
  });
  // 将来源和推理信息发送给客户端
  return response.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
