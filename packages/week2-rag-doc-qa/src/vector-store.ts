import { Pool } from 'pg';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';

/**
 * 向量存储管理
 * 使用 pgvector 存储文档向量
 */
export class VectorStoreManager {
  private store: PGVectorStore;
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.store = new PGVectorStore(new OpenAIEmbeddings(), {
      pool: this.pool,
      tableName: 'document_embeddings',
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
    });
  }

  /**
   * 初始化数据库表
   */
  async initialize(): Promise<void> {
    await this.store.initialize();
  }

  /**
   * 添加文档块到向量存储
   */
  async addDocuments(
    texts: string[],
    metadatas?: Array<Record<string, any>>
  ): Promise<string[]> {
    const documents = texts.map(
      (text, index) =>
        new Document({
          pageContent: text,
          metadata: metadatas?.[index] || {},
        })
    );
    return await this.store.addDocuments(documents);
  }

  /**
   * 相似度搜索
   */
  async similaritySearch(
    query: string,
    k: number = 4
  ): Promise<Array<{ pageContent: string; metadata: any }>> {
    return await this.store.similaritySearch(query, k);
  }

  /**
   * 清空所有文档
   */
  async clear(): Promise<void> {
    await this.pool.query('TRUNCATE TABLE document_embeddings');
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

