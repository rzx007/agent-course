import { embed, embedMany, EmbeddingModel } from 'ai';
import { db } from '../db';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';
import { ollama } from 'ai-sdk-ollama'

const embeddingModel = 'nomic-embed-text';

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '');
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: ollama.embeddingModel(embeddingModel),
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: ollama.embeddingModel(embeddingModel),
    value: input,
  });
  console.log(`🔍 Embedding 维度: ${embedding.length}`);
  return embedding;
};

/**
 * 查找相关内容
 * @param userQuery 用户查询
 * @returns 相关内容
 */
export const findRelevantContent = async (userQuery: string) => {
  // 向量化用户查询
  const userQueryEmbedded = await generateEmbedding(userQuery);
  // 计算相似度
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;
  // 查询相似度大于0.5的
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy(t => desc(t.similarity))
    .limit(4);
  return similarGuides;
};

//整体流程

// 用户输入: "记住我喜欢米饭"
//     ↓
// AI 调用 addResource 工具
//     ↓
// content: "用户喜欢米饭"
//     ↓
// 生成 embedding 向量
//     ↓
// 存入 PostgreSQL pgvector
    
// ---分割线---

// 用户提问: "我喜欢什么食物？"
//     ↓
// AI 调用 getInformation 工具
//     ↓
// question 转为 embedding 向量
//     ↓
// 使用余弦相似度搜索 (line 41-44)
//     ↓
// 返回: "用户喜欢米饭" (similarity: 0.95)
//     ↓
// AI 根据检索结果回答