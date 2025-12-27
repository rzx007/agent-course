import { Pool } from 'pg';
import { PGVectorStore } from '@langchain/postgres';
import { OpenAIEmbeddings } from '@langchain/openai';

/**
 * 向量存储管理
 * 使用 pgvector 存储文档向量
 */
export class VectorStoreManager {
  private store: PGVectorStore;
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.store = new PGVectorStore(
      new OpenAIEmbeddings(),
      {
        postgresConnectionOptions: {
          connectionString,
        },
        tableName: 'document_embeddings',
        columns: {
          idColumnName: 'id',
          vectorColumnName: 'embedding',
          contentColumnName: 'content',
          metadataColumnName: 'metadata',
        },
      }
    );
  }

  /**
   * 初始化数据库表
   */
  async initialize(): Promise<void> {
    await this.store.ensureTableInDatabase();
  }

  /**
   * 添加文档块到向量存储
   */
  async addDocuments(
    texts: string[],
    metadatas?: Array<Record<string, any>>
  ): Promise<string[]> {
    return await this.store.addDocuments(
      texts.map((text, index) => ({
        pageContent: text,
        metadata: metadatas?.[index] || {},
      }))
    );
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

