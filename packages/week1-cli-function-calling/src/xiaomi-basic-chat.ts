import { loadEnv } from "./load-env.js";

import { createXiaomiMimo } from "./xiaomimimo-provider.js";
import { generateText } from "ai";
import type { LanguageModel } from "ai";

/**
 * 基础对话示例
 * 演示如何使用 Vercel AI SDK 进行简单的文本生成
 */
export async function basicChat(prompt: string, baseURL?: string) {
  loadEnv();
  // 创建 XiaomiMimo provider
  const xiaomimimo = createXiaomiMimo({
    baseURL:
      baseURL ||
      process.env.XIAOMIMIMO_BASE_URL ||
      "https://api.xiaomimimo.com/v1",
    apiKey: process.env.XIAOMIMIMO_API_KEY || process.env.OPENAI_API_KEY,
  });

  const { text } = await generateText({
    model: xiaomimimo("mimo-v2-flash") as unknown as LanguageModel,
    prompt,
  });

  return text;
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  const prompt = process.argv[2] || "你好，请介绍一下你自己";
  basicChat(prompt)
    .then((response) => {
      console.log("AI 回复:", response);
    })
    .catch((error) => {
      console.error("错误:", error);
      process.exit(1);
    });
}
