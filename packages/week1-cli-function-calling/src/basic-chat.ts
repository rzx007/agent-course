import { loadEnv } from './load-env.js';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import type { LanguageModelV1 } from 'ai';

/**
 * 基础对话示例
 * 演示如何使用 Vercel AI SDK 进行简单的文本生成
 */
export async function basicChat(
  prompt: string,
  baseURL?: string,
  options?: { stream?: boolean }
) {
  loadEnv();
  // 创建配置了 baseURL 的 OpenAI provider
  const openai = createOpenAI({
    baseURL: baseURL || process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const model = openai.chat('mimo-v2-flash') as unknown as LanguageModelV1;

  // 如果启用流式输出
  if (options?.stream) {
    const result = streamText({
      model,
      prompt,
    });

    // 流式输出到终端
    let fullText = '';
    // textStream 是 AsyncIterableStream，可以直接迭代
    const textStream = (result as any).textStream as AsyncIterable<string>;
    for await (const textPart of textStream) {
      process.stdout.write(textPart);
      fullText += textPart;
    }
    process.stdout.write('\n'); // 换行

    return fullText;
  }

  // 非流式输出（原有方式）
  const { text } = await generateText({
    model,
    prompt,
  });

  return text;
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  const prompt = process.argv[2] || '你好，请介绍一下你自己';
  basicChat(prompt)
    .then((response) => {
      console.log('AI 回复:', response);
    })
    .catch((error) => {
      console.error('错误:', error);
      process.exit(1);
    });
}

