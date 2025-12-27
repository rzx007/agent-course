# AI Agent 学习课程

这是一个 AI Agent 开发的 monorepo 学习项目，基于 4 周学习计划。

## 项目结构

```
agent-course/
├── packages/
│   ├── week1-cli-function-calling/     # Week 1: CLI 工具，Function Calling
│   └── week2-rag-doc-qa/               # Week 2: RAG 文档问答机器人
├── package.json
├── pnpm-workspace.yaml
└── course-plan.md
```

## 技术栈

所有项目统一使用 **Vercel AI SDK** (`ai` 包) 作为 LLM 调用接口，提供：

- 统一的 API 接口，支持 OpenAI、Anthropic 等多种提供商
- 流式响应支持
- Function Calling 支持
- 更好的 TypeScript 类型支持

## 子项目

### Week 1: CLI Function Calling

学习基础 API 对接和 Function Calling。

**功能**:

- 基础对话示例
- CLI 工具：使用 GPT 重命名文件夹里的文件（Function Calling）

**技术栈**: Node.js + TypeScript + Vercel AI SDK

**快速开始**:

```bash
cd packages/week1-cli-function-calling
pnpm install
# 设置 OPENAI_API_KEY 环境变量
pnpm dev basic-chat "你好"
pnpm dev rename --dir ./path/to/folder
```

### Week 2: RAG 文档问答

学习 RAG (Retrieval-Augmented Generation) 技术，构建文档问答系统。

**功能**:

- 读取项目 README.md 文件
- 文档切片和向量化
- 存储到 PostgreSQL (pgvector)
- 基于向量检索的问答

**技术栈**: Node.js + TypeScript + Vercel AI SDK + LangChain + PostgreSQL (pgvector)

**快速开始**:

```bash
cd packages/week2-rag-doc-qa
pnpm install
# 配置 .env 文件（OPENAI_API_KEY 和 DATABASE_URL）
pnpm ingest  # 导入文档
pnpm dev chat  # 启动问答
```

## 环境要求

- Node.js 18+
- pnpm 10+
- PostgreSQL (Week 2 需要，需启用 pgvector 扩展)

## 安装

```bash
# 安装所有依赖
pnpm install

# 安装特定子项目依赖
cd packages/week1-cli-function-calling && pnpm install
```

## 学习计划

详细学习计划请查看 [course-plan.md](./course-plan.md)

## License

ISC
