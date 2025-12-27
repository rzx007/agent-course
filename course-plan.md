Week 1: 基础与 API 对接
申请 OpenAI 或 Anthropic 的 API Key。
使用 Node.js 写一个脚本，实现基本的对话。
关键练习：实现一个 CLI 工具，让 GPT 帮你重命名文件夹里的文件（学习 Function Calling）。
Week 2: 掌握 RAG (构建你的知识库)
使用 LangChain.js 或 LlamaIndex.TS。
项目：写一个 "文档问答机器人"。读取你以前项目的 README.md，切片存入 pgvector，然后允许用户提问关于项目架构的问题。
Week 3: 全栈 AI 应用 (Vercel AI SDK)
使用 Next.js + Vercel AI SDK。
项目：构建一个具有 "流式 UI" (Streaming UI) 的聊天界面。实现 useChat 和后端 API 的对接。
尝试使用 Generative UI（即 LLM 直接生成 React 组件给前端渲染）。
Week 4: 进阶 Agent 编排 (LangGraph)
这是目前的难点和前沿。学习 LangGraph.js（LangChain 推出的图编排框架）。
项目：构建一个具有“循环”能力的 Agent。例如一个“代码修复 Agent”：运行代码 -> 报错 -> 读取错误 -> LLM 修复代码 -> 再次运行 -> 直到成功。