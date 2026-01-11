# RAG 流程文档

## 系统概述

这是一个基于 AI SDK 的 RAG（Retrieval-Augmented Generation）知识库系统，使用向量检索技术实现智能问答。

## 技术栈

- **AI 模型**: DeepSeek (mimo-v2-flash)
- **向量模型**: [Ollama (nomic-embed-text)](https://ollama.com/library/nomic-embed-text)
- **数据库**: PostgreSQL + [pgvector](https://github.com/pgvector/pgvector)
- **ORM**: Drizzle ORM
- **框架**: Next.js

### 数据库初始化

1. **安装依赖**
```bash
pnpm install
```

1. **生成迁移文件**

```bash
pnpm db:generate
```

2. **执行数据库迁移**

```bash
pnpm db:migrate
```

3. **（可选）打开数据库管理界面**

```bash
pnpm db:studio
```

### 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用

## 核心流程

### 1. 知识存储流程（addResource 工具）

```
用户输入: "记住我喜欢米饭"
    ↓
AI 调用 addResource 工具
    ↓
[route.ts] 接收 content: "用户喜欢米饭"
    ↓
[resources.ts] createResource 函数处理
    ↓
步骤 1: 存储原始文本到 resources 表
    ↓
步骤 2: 调用 generateEmbeddings 生成向量
    ↓
[embedding.ts] generateChunks 切分文本（按句号分割）
    ↓
[embedding.ts] embedMany 批量生成向量
    ↓
[resources.ts] 将向量存入 embeddings 表
    ↓
返回: "Resource successfully created and embedded."
```

**关键代码位置**:
- 工具定义: `route.ts:32-48`
- 存储逻辑: `resources.ts:13-45`
- 向量生成: `embedding.ts:16-25`

### 2. 知识检索流程（getInformation 工具）

```
用户提问: "我喜欢什么食物？"
    ↓
AI 调用 getInformation 工具
    ↓
[route.ts] 传入 question: "我喜欢什么食物？"
    ↓
[embedding.ts] findRelevantContent 函数处理
    ↓
步骤 1: generateEmbedding 将问题转为向量
    ↓
步骤 2: 使用余弦相似度搜索（cosineDistance）
    ↓
步骤 3: 筛选相似度 > 0.5 的结果
    ↓
步骤 4: 按相似度降序排序，返回前 4 条
    ↓
返回: [{name: "用户喜欢米饭", similarity: 0.95}, ...]
    ↓
AI 根据检索结果生成回答
```

**关键代码位置**:
- 工具定义: `route.ts:49-56`
- 检索逻辑: `embedding.ts:42-58`
- 向量查询: `embedding.ts:27-35`

## 数据库结构

### resources 表（存储原始内容）

```typescript
{
  id: varchar(191),           // 主键，nanoid 生成
  content: text,              // 原始文本内容
  createdAt: timestamp,       // 创建时间
  updatedAt: timestamp        // 更新时间
}
```

### embeddings 表（存储向量）

```typescript
{
  id: varchar(191),           // 主键
  resourceId: varchar(191),   // 关联 resources 表
  content: text,              // 文本片段（chunk）
  embedding: vector,          // 向量（pgvector 类型）
}
```

## 向量化流程图

### 完整向量化流程

```mermaid
graph TB
    A[原始文本输入] --> B[文本预处理]
    B --> C[文本分段切片]
    C --> D[批量向量化]
    D --> E[入库存储]
    
    B --> B1[去除首尾空格 trim]
    
    C --> C1[按句号分割 split'.']
    C1 --> C2[过滤空字符串]
    C2 --> C3[生成文本块 chunks]
    
    D --> D1[调用 Ollama embedMany]
    D1 --> D2[模型: nomic-embed-text]
    D2 --> D3[生成 768 维向量]
    
    E --> E1[插入 resources 表]
    E --> E2[插入 embeddings 表]
    E1 --> E3[存储原始完整文本]
    E2 --> E4[存储文本块]
    E2 --> E5[存储对应向量]
    E2 --> E6[关联 resourceId]
```

### 详细步骤说明

**步骤 1: 原始文本输入**
- 用户通过 `addResource` 工具提交内容
- 示例: "用户喜欢米饭。用户住在北京。"

**步骤 2: 文本预处理**
```typescript
// embedding.ts:9-10
input.trim()  // 去除首尾空格
```

**步骤 3: 文本分段切片**
```typescript
// embedding.ts:11-12
.split('.')                    // 按句号分割
.filter(i => i !== '')         // 过滤空字符串
// 结果: ["用户喜欢米饭", "用户住在北京"]
```

**步骤 4: 批量向量化**
```typescript
// embedding.ts:19-23
const { embeddings } = await embedMany({
  model: embeddingModel,
  values: chunks,              // ["用户喜欢米饭", "用户住在北京"]
});
// 结果: 每个文本块生成 768 维向量数组
```

**步骤 5: 入库存储**
```typescript
// resources.ts:13-35
// 5.1 存储原始文本到 resources 表
await db.insert(resourcesTable).values({
  content: "用户喜欢米饭。用户住在北京。",  // 完整原文
});

// 5.2 批量存储向量到 embeddings 表
await db.insert(embeddingsTable).values([
  {
    resourceId: "abc123",
    content: "用户喜欢米饭",
    embedding: [0.1, 0.2, ..., 0.8],  // 768 维向量
  },
  {
    resourceId: "abc123",
    content: "用户住在北京",
    embedding: [0.3, 0.1, ..., 0.5],  // 768 维向量
  }
]);
```

### 数据流转示意

```mermaid
graph LR
    A["用户喜欢米饭。用户住在北京。"] --> B["['用户喜欢米饭', '用户住在北京']"]
    B --> C1["向量1: [0.1, 0.2, ..., 0.8]"]
    B --> C2["向量2: [0.3, 0.1, ..., 0.5]"]
    
    A --> D[(resources 表)]
    C1 --> E[(embeddings 表 - 记录1)]
    C2 --> F[(embeddings 表 - 记录2)]
    
    D -.关联.- E
    D -.关联.- F
```

## 关键技术细节

### 1. 文本切片策略

```typescript
// embedding.ts:9-14
const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')      // 按句号分割
    .filter(i => i !== '');
};
```

**特点**: 简单的句子级切分，适合短文本知识库。

### 2. 向量相似度计算

```typescript
// embedding.ts:46-49
const similarity = sql<number>`1 - (${cosineDistance(
  embeddings.embedding,
  userQueryEmbedded,
)})`;
```

**算法**: 余弦距离（cosineDistance），值越接近 1 表示越相似。

### 3. 检索阈值设置

```typescript
// embedding.ts:54
.where(gt(similarity, 0.5))  // 相似度阈值：0.5
.limit(4)                     // 最多返回 4 条结果
```

**参数说明**:
- `similarity > 0.5`: 过滤掉不相关的结果
- `limit(4)`: 控制上下文窗口大小，避免 token 溢出

### 4. 向量类型转换

```typescript
// resources.ts:33
embedding: sql`${JSON.stringify(embedding.embedding)}::vector`
```

**原因**: 将 JavaScript 数组转换为 PostgreSQL 的 vector 类型。

## System Prompt 设计

```typescript
// route.ts:26-28
system: `你是一个乐于助人的助手。在回答任何问题之前，请先检查你的知识库。
只使用工具调用中的信息来回答问题。
如果在工具调用中没有找到相关信息，请回复"抱歉，我不知道。"`
```

**关键约束**:
- 强制使用知识库信息
- 避免模型幻觉（hallucination）
- 明确告知无法回答的情况

## 完整交互示例

### 示例 1: 存储知识

**用户**: "记住我的生日是 1990 年 1 月 1 日"

1. AI 调用 `addResource`
2. 存储原文: "用户的生日是 1990 年 1 月 1 日"
3. 生成 1 个向量（单句，不切分）
4. 返回: "Resource successfully created and embedded."

### 示例 2: 检索问答

**用户**: "我的生日是什么时候？"

1. AI 调用 `getInformation`
2. 向量化问题
3. 检索到: [{name: "用户的生日是 1990 年 1 月 1 日", similarity: 0.92}]
4. AI 生成回答: "你的生日是 1990 年 1 月 1 日。"

### 示例 3: 无匹配结果

**用户**: "今天天气怎么样？"

1. AI 调用 `getInformation`
2. 检索结果为空（相似度 < 0.5）
3. AI 回复: "抱歉，我不知道。"

## 性能优化建议

### 1. 向量维度

```typescript
// embedding.ts:33
console.log(`🔍 Embedding 维度: ${embedding.length}`);
```

当前使用 `nomic-embed-text`，通常为 768 维。可根据需求选择更轻量的模型。

### 2. 批量插入

```typescript
// resources.ts:26-35
await db.insert(embeddingsTable).values(
  embeddings.map(...)  // 批量插入，减少数据库往返
);
```

### 3. 索引优化

确保 PostgreSQL 中为 `embeddings.embedding` 字段创建了 HNSW 或 IVFFlat 索引：

```sql
CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);
```

## 错误处理

### 1. 插入失败

```typescript
// resources.ts:36-39
catch (error) {
  console.error("插入嵌入向量失败:", error);
  throw new Error("Failed to insert embeddings into database");
}
```

### 2. 工具调用失败

```typescript
// route.ts:44-45
catch (error) {
  return { error: "Error adding resource" };
}
```

## 限流配置

```typescript
// route.ts:14
export const maxDuration = 30;  // 流式响应最长 30 秒
```

```typescript
// route.ts:30
stopWhen: stepCountIs(5)  // 最多 5 步工具调用，防止死循环
```

## 扩展方向

### 1. 支持文件上传

- 添加 PDF、Word 解析器
- 实现更智能的文本切片（chunk size, overlap）

### 2. 多模态支持

- 集成图像向量化（CLIP）
- 支持图文混合检索

### 3. 元数据过滤

- 为 embeddings 表添加 metadata 字段
- 支持按时间、标签、来源过滤

### 4. 重排序（Rerank）

- 在初步检索后使用交叉编码器重排序
- 提高 Top-K 结果的准确性

## 配置清单

### 环境变量

```bash
# .env
OPENAI_API_KEY=your_deepseek_key
OPENAI_BASE_URL=https://api.deepseek.com
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### 依赖项

```json
{
  "ai": "^3.x",
  "@ai-sdk/deepseek": "^1.x",
  "ai-sdk-ollama": "^1.x",
  "drizzle-orm": "^0.x",
  "pg": "^8.x"
}
```

## 总结

这个 RAG 系统采用**双表存储**架构：
- `resources` 保留原始文本（便于追溯）
- `embeddings` 存储向量化的文本片段（用于检索）

核心优势：
- ✅ 简洁的工具调用设计
- ✅ 自动向量化流程
- ✅ 高效的相似度搜索
- ✅ 防止模型幻觉的 prompt 约束

适用场景：
- 个人知识库
- 客服问答系统
- 文档检索助手
