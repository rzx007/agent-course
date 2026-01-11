"use server";

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from "@/lib/db/schema/resources";
import { db } from "../db";
import { generateEmbeddings } from "../ai/embedding";
import { embeddings as embeddingsTable } from "../db/schema/embeddings";
import { sql } from "drizzle-orm";

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    // 1. 存储原始文本
    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning();

    // 2. 生成嵌入向量并存储
    const embeddings = await generateEmbeddings(content);
    try {
      const res = await db.insert(embeddingsTable).values(
        embeddings.map((embedding) => ({
          resourceId: resource.id,
          content: embedding.content,

          // 将嵌入向量转换为 PostgreSQL 的 vector 类型
          // 使用 sql 模板字符串将 JSON 格式的向量数组转换为数据库可识别的 vector 类型
          embedding: sql`${JSON.stringify(embedding.embedding)}::vector`,
        }))
      );
    } catch (error) {
      console.error("插入嵌入向量失败:", error);
      throw new Error("Failed to insert embeddings into database");
    }
    return "Resource successfully created and embedded.";
  } catch (e) {
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : "Error, please try again.";
  }
};
