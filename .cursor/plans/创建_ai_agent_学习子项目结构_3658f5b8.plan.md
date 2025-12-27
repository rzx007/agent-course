---
name: 创建 AI Agent 学习子项目结构
overview: 为4周学习计划创建 monorepo 子项目结构，每个 week 对应一个独立的 package，包含基础配置和 README
todos:
  - id: create-week1-structure
    content: 创建 Week 1 CLI Function Calling 项目结构和配置文件
    status: completed
  - id: create-week2-structure
    content: 创建 Week 2 RAG 文档问答项目结构和配置文件
    status: completed
  - id: create-week3-structure
    content: 创建 Week 3 Next.js AI Chat 项目结构和配置文件
    status: cancelled
  - id: create-week4-structure
    content: 创建 Week 4 LangGraph Agent 项目结构和配置文件
    status: cancelled
  - id: create-shared-config
    content: 创建根目录共享配置文件（tsconfig.json, .gitignore）
    status: completed
  - id: update-root-readme
    content: 更新根目录 README.md 添加项目总览和使用说明
    status: completed
    dependencies:
      - create-week1-structure
      - create-week2-structure
      - create-week3-structure
      - create-week4-structure
---

# 创建 AI Agent

学习子项目结构

## 项目结构规划

基于 `course-plan.md` 的4周学习计划，创建以下 monorepo 结构：

```javascript
agent-course/
├── packages/
│   ├── week1-cli-function-calling/     # Week 1: CLI 工具，Function Calling
│   ├── week2-rag-doc-qa/               # Week 2: RAG 文档问答机器人
│   ├── week3-nextjs-ai-chat/           # Week 3: Next.js + Vercel AI SDK
│   └── week4-langgraph-agent/          # Week 4: LangGraph 代码修复 Agent
├── package.json                         # 根 package.json（已存在）
├── pnpm-workspace.yaml                  # pnpm workspace 配置（已存在）
└── course-plan.md                       # 学习计划（已存在）
```



## 实施步骤

### 1. Week 1: CLI Function Calling (`packages/week1-cli-function-calling/`)

- **技术栈**: Node.js + TypeScript + Vercel AI SDK
- **功能**: 基础对话 + CLI 工具（文件重命名）
- **依赖**: `ai` (Vercel AI SDK), `commander` (CLI), `typescript`
- **结构**:
- `src/` - 源代码
- `src/basic-chat.ts` - 基础对话示例
- `src/cli.ts` - CLI 入口
- `src/file-renamer.ts` - Function Calling 实现
- `package.json`, `tsconfig.json`, `README.md`

### 2. Week 2: RAG 文档问答 (`packages/week2-rag-doc-qa/`)

- **技术栈**: Node.js + TypeScript + PostgreSQL (pgvector) + Vercel AI SDK
- **功能**: 文档切片、向量存储、问答检索
- **依赖**: `ai` (Vercel AI SDK), `langchain` (用于向量存储和检索), `pgvector`, `@langchain/postgres`, `typescript`
- **结构**:
- `src/` - 源代码
- `src/document-loader.ts` - 读取 README.md
- `src/vector-store.ts` - pgvector 存储
- `src/qa-bot.ts` - 问答逻辑
- `src/cli.ts` - 交互式问答 CLI
- `package.json`, `tsconfig.json`, `README.md`, `.env.example`

### 3. Week 3: Next.js AI Chat (`packages/week3-nextjs-ai-chat/`)

- **技术栈**: Next.js 14+ (App Router) + TypeScript + Vercel AI SDK
- **功能**: 流式聊天界面 + Generative UI
- **依赖**: `next`, `react`, `ai` (Vercel AI SDK), `typescript`
- **结构**:
- `app/` - Next.js App Router
- `app/api/chat/route.ts` - 流式 API 路由
- `app/page.tsx` - 主页面（聊天界面）
- `components/` - React 组件
- `package.json`, `tsconfig.json`, `next.config.js`, `README.md`, `.env.example`

### 4. Week 4: LangGraph Agent (`packages/week4-langgraph-agent/`)

- **技术栈**: Node.js + TypeScript + LangGraph + Vercel AI SDK
- **功能**: 代码修复 Agent（循环执行直到成功）
- **依赖**: `@langchain/langgraph`, `langchain`, `ai` (Vercel AI SDK - 用于 LLM 调用), `typescript`
- **结构**:
- `src/` - 源代码
- `src/agent/` - Agent 相关代码
- `src/agent/graph.ts` - LangGraph 图定义
- `src/agent/nodes.ts` - 节点实现（运行代码、读取错误、修复代码）
- `src/cli.ts` - CLI 入口
- `package.json`, `tsconfig.json`, `README.md`, `.env.example`

## 共享配置

- 根目录 `tsconfig.json` - 共享 TypeScript 配置
- 根目录 `.gitignore` - 忽略 node_modules, .env 等
- 每个子项目独立的 `package.json` 和 `tsconfig.json`（继承根配置）

## 技术栈统一说明

所有项目统一使用 **Vercel AI SDK** (`ai` 包) 作为 LLM 调用接口，它提供了：

- 统一的 API 接口，支持 OpenAI、Anthropic 等多种提供商
- 流式响应支持
- Function Calling 支持
- 更好的 TypeScript 类型支持

Week 2 和 Week 4 会结合 LangChain 的向量存储和 Agent 编排能力，但 LLM 调用统一通过 Vercel AI SDK。

## 文件创建清单

1. `packages/week1-cli-function-calling/package.json`
2. `packages/week1-cli-function-calling/tsconfig.json`
3. `packages/week1-cli-function-calling/README.md`
4. `packages/week1-cli-function-calling/src/basic-chat.ts` (示例骨架)
5. `packages/week1-cli-function-calling/src/cli.ts` (示例骨架)
6. `packages/week2-rag-doc-qa/package.json`
7. `packages/week2-rag-doc-qa/tsconfig.json`
8. `packages/week2-rag-doc-qa/README.md`
9. `packages/week2-rag-doc-qa/.env.example`
10. `packages/week3-nextjs-ai-chat/package.json`
11. `packages/week3-nextjs-ai-chat/tsconfig.json`
12. `packages/week3-nextjs-ai-chat/next.config.js`
13. `packages/week3-nextjs-ai-chat/README.md`
14. `packages/week3-nextjs-ai-chat/.env.example`
15. `packages/week3-nextjs-ai-chat/app/page.tsx` (基础骨架)
16. `packages/week4-langgraph-agent/package.json`
17. `packages/week4-langgraph-agent/tsconfig.json`
18. `packages/week4-langgraph-agent/README.md`