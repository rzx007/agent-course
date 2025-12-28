# Week 1: CLI Function Calling

学习基础 API 对接和 Function Calling，掌握 Vercel AI SDK 的使用。

## 功能

- **基础对话** (`basic-chat.ts`) - 简单的文本生成示例
- **交互式聊天** (`index.ts`) - 多轮对话，支持流式输出
- **文件重命名工具** (`file-renamer.ts`) - 使用 Function Calling 让 AI 帮助重命名文件
- **HTTP 服务器** (`server.ts`) - 提供 HTTP API 接口
- **自定义 Provider** (`xiaomimimo-provider.ts`) - 支持小米 Mimo API

## 技术栈

- **Node.js** + **TypeScript**
- **Vercel AI SDK** (`ai`) - 统一的 LLM 调用接口
- **Commander** - CLI 框架
- **Express** - HTTP 服务器（可选）
- **readline** - 交互式命令行输入

## 环境配置

1. 安装依赖：

```bash
pnpm install
```

2. 创建 `.env` 文件（在项目根目录或 `packages/week1-cli-function-calling/` 目录）：

```env
# OpenAI API 配置
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，默认使用官方 API

# 或者使用自定义 API（如小米 Mimo）
# OPENAI_BASE_URL=https://api.xiaomimimo.com/v1
# MODEL_NAME=mimo-v2-flash  # 可选，根据 API 提供商选择模型
```

## 使用

### 1. 基础对话

简单的单次对话示例：

```bash
# 使用默认提示
pnpm dev basic-chat

# 自定义提示
pnpm dev basic-chat "你好，请介绍一下你自己"

# 流式输出
pnpm dev basic-chat "写一首诗" --stream
```

### 2. 交互式聊天

启动多轮对话，支持流式输出：

```bash
# 直接运行 index.ts
tsx src/index.ts

# 或者添加到 package.json scripts
pnpm dev:chat
```

**使用说明：**

- 输入消息后按回车发送
- 输入 `exit` 或按 `Ctrl+C` 退出
- 支持多轮对话，自动维护对话历史

### 3. 文件重命名工具（Function Calling）

使用 AI 的 Function Calling 功能重命名文件：

```bash
# 基本用法
pnpm dev rename --dir ./path/to/folder

# 自定义重命名指令
pnpm dev rename --dir ./css --instruction "将所有文件名改为小写，使用连字符分隔"

# 示例：重命名当前目录的 css 文件夹
pnpm dev rename --dir ./css
```

**工作原理：**

1. AI 分析文件夹中的文件
2. 根据你的指令决定需要重命名的文件
3. 调用 `renameFile` 工具执行重命名
4. 返回执行结果和最终回答

### 4. HTTP 服务器

启动 HTTP API 服务器：

```bash
pnpm dev:server
```

服务器默认运行在 `http://localhost:3000`，提供聊天 API 接口。

## 项目结构

```
src/
├── basic-chat.ts          # 基础对话示例
├── index.ts               # 交互式聊天（多轮对话）
├── file-renamer.ts        # 文件重命名工具（Function Calling）
├── cli.ts                 # CLI 入口，整合所有命令
├── server.ts              # HTTP 服务器
├── load-env.ts            # 环境变量加载工具
├── xiaomi-basic-chat.ts   # 小米 API 示例
└── xiaomimimo-provider.ts # 小米 Mimo API Provider
```

## 核心概念

### Function Calling 流程

1. **模型决定调用工具** - AI 分析用户需求，决定需要调用哪个工具
2. **执行工具** - SDK 自动执行工具函数
3. **结果返回模型** - 工具执行结果自动添加到对话历史
4. **生成最终回答** - 模型根据工具结果生成最终回答

示例代码：

```typescript
const { text, toolCalls } = await generateText({
  model: openai.chat("gpt-4o-mini"),
  prompt: "重命名这些文件",
  tools: {
    renameFile: {
      description: "重命名文件",
      inputSchema: z.object({
        /* ... */
      }),
      execute: async ({ files }) => {
        // 执行重命名逻辑
        return results;
      },
    },
  },
});
// text 已经是模型根据工具结果生成的最终回答
```

### 流式输出

使用 `streamText` 实现流式输出，提升用户体验：

```typescript
const result = streamText({
  model: openai.chat("gpt-4o-mini"),
  messages,
});

for await (const delta of result.textStream) {
  process.stdout.write(delta); // 实时显示
}
```

## 学习目标

- ✅ 掌握 Vercel AI SDK 的基本使用
- ✅ 理解 Function Calling 的工作原理
- ✅ 实现流式输出和多轮对话
- ✅ 创建自定义 API Provider
- ✅ 实现一个实用的 CLI 工具

## 常见问题

### Q: 如何切换不同的 API 提供商？

A: 修改 `.env` 文件中的 `OPENAI_BASE_URL` 和 `MODEL_NAME`。例如使用小米 API：

```env
OPENAI_BASE_URL=https://api.xiaomimimo.com/v1
MODEL_NAME=mimo-v2-flash
```

### Q: Function Calling 如何工作？

A: Vercel AI SDK 会自动处理整个流程：

1. 模型决定调用工具
2. SDK 执行工具函数
3. 结果自动返回给模型
4. 模型生成最终回答

你只需要定义工具和 `execute` 函数即可。

### Q: 如何添加新的工具？

A: 在 `tools` 对象中添加新的工具定义：

```typescript
tools: {
  yourTool: {
    description: "工具描述",
    inputSchema: z.object({ /* 参数定义 */ }),
    execute: async ({ param }) => {
      // 工具逻辑
      return result;
    },
  },
}
```

## 参考资源

- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [Function Calling 指南](https://sdk.vercel.ai/docs/guides/tools-and-tool-calling)
- [OpenAI API 文档](https://platform.openai.com/docs)
