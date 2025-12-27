import { openai } from 'ai/openai';
import { generateText } from 'ai';

/**
 * 基础对话示例
 * 演示如何使用 Vercel AI SDK 进行简单的文本生成
 */
export async function basicChat(prompt: string) {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
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

