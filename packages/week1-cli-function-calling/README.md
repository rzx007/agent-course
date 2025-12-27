# Week 1: CLI Function Calling

学习基础 API 对接和 Function Calling。

## 功能

- 基础对话示例
- CLI 工具：使用 GPT 重命名文件夹里的文件（Function Calling）

## 技术栈

- Node.js + TypeScript
- Vercel AI SDK (`ai`)
- Commander (CLI 框架)

## 使用

1. 安装依赖：
```bash
pnpm install
```

2. 设置环境变量（创建 `.env` 文件）：
```
OPENAI_API_KEY=your_api_key_here
# 或
ANTHROPIC_API_KEY=your_api_key_here
```

3. 运行基础对话：
```bash
pnpm dev basic-chat
```

4. 运行文件重命名工具：
```bash
pnpm dev rename --dir ./path/to/folder
```

## 学习目标

- 掌握 Vercel AI SDK 的基本使用
- 理解 Function Calling 的工作原理
- 实现一个实用的 CLI 工具

