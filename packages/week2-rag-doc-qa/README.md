# Week 2: RAG 文档问答机器人

学习 RAG (Retrieval-Augmented Generation) 技术，构建文档问答系统。

## 功能

- 读取项目 README.md 文件
- 文档切片和向量化
- 存储到 PostgreSQL (pgvector)
- 基于向量检索的问答

## 技术栈

- Node.js + TypeScript
- Vercel AI SDK (`ai`) - LLM 调用
- LangChain - 向量存储和检索
- PostgreSQL + pgvector - 向量数据库

## 前置要求

1. 安装 PostgreSQL 并启用 pgvector 扩展：
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. 创建数据库和表（程序会自动创建表结构）

## 使用

1. 安装依赖：
```bash
pnpm install
```

2. 配置环境变量（复制 `.env.example` 为 `.env`）：
```
OPENAI_API_KEY=your_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/rag_db
```

3. 导入文档（首次使用）：
```bash
pnpm ingest
```

4. 启动问答 CLI：
```bash
pnpm dev
```

## 学习目标

- 理解 RAG 的工作原理
- 掌握文档切片和向量化
- 学习向量数据库的使用
- 实现基于检索的问答系统

