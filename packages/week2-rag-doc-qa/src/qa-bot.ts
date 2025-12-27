import { openai } from 'ai/openai';
import { generateText } from 'ai';
import { VectorStoreManager } from './vector-store.js';

/**
 * 问答机器人
 * 使用 RAG 技术进行文档问答
 */
export class QABot {
  constructor(private vectorStore: VectorStoreManager) {}

  /**
   * 回答问题
   */
  async answer(question: string): Promise<string> {
    // 1. 从向量存储中检索相关文档块
    const relevantDocs = await this.vectorStore.similaritySearch(question, 4);
    
    // 2. 构建上下文
    const context = relevantDocs
      .map((doc, index) => `[文档片段 ${index + 1}]\n${doc.pageContent}`)
      .join('\n\n');

    // 3. 使用 Vercel AI SDK 生成回答
    const prompt = `你是一个文档问答助手。基于以下文档内容回答用户的问题。

文档内容：
${context}

用户问题：${question}

请基于文档内容回答问题。如果文档中没有相关信息，请说明。`;

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
    });

    return text;
  }
}

