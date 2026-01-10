# RAG Chatbot

一个基于 Next.js 14+ 的现代化 AI 聊天机器人应用，集成了 RAG（检索增强生成）、流式响应、用户认证和会话管理等功能。

## 技术栈

### 前端框架

- **Next.js 16.1.1** - React 全栈框架
- **React 19.2.3** - UI 组件库
- **TypeScript** - 类型安全
- **Tailwind CSS 4** - 样式框架

### AI 集成

- **AI SDK 6.0.3** - Vercel AI SDK
- **@ai-sdk/deepseek** - DeepSeek 模型支持
- **@ai-sdk/openai** - OpenAI 兼容接口
- **小蜜米莫 AI 平台** - 提供 mimo-v2-flash 模型

### 数据库

- **PostgreSQL** - 主数据库
- **Drizzle ORM 0.45.1** - 类型安全的 ORM
- **Redis/IORedis** - 流式响应缓存（可选）

### 认证系统

- **Better Auth 1.4.10** - 现代化认证方案
- **Better Auth UI** - 开箱即用的认证界面组件
- 支持邮箱密码登录
- 支持 GitHub OAuth
- 用户名插件支持
- 可自定义认证页面

### UI 组件

- **shadcn/ui** - 基于 Radix UI 和 Tailwind CSS 的组件库
- **Lucide React** - 图标库
- **Sonner** - Toast 通知
- **date-fns** - 日期处理

### 其他特性

- **Resumable Stream** - 可恢复的流式传输
- **Shiki** - 代码高亮
- **Zustand** - 状态管理

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- Redis（可选，用于流式响应恢复）

### 安装依赖

```bash
pnpm install
```

### 环境变量配置

在项目根目录或 `packages/rag-chatbot` 目录下创建 `.env` 文件：

```bash
# AI 模型配置（小蜜米莫平台）
OPENAI_BASE_URL=https://api.xiaomimimo.com/v1
OPENAI_API_KEY=your_api_key_here

# 数据库配置
POSTGRES_URL=postgresql://user:password@host:port/database

# Better Auth 配置
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth（可选）
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Redis 配置（可选，用于流式响应恢复）
REDIS_URL=redis://localhost:6379
```

### 数据库初始化

1. **测试数据库连接**

```bash
pnpm db:test
```

1. **生成迁移文件**

```bash
pnpm db:generate
```

1. **执行数据库迁移**

```bash
pnpm db:migrate
```

1. **（可选）打开数据库管理界面**

```bash
pnpm db:studio
```

### 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```bash
rag-chatbot/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证相关页面
│   │   ├── account/         # 账户管理
│   │   ├── auth/            # 登录/注册
│   │   └── api/auth/        # 认证 API
│   ├── (chat)/              # 聊天相关页面
│   │   ├── api/             # 聊天 API
│   │   │   ├── chat/        # 聊天流式接口
│   │   │   └── history/     # 历史记录接口
│   │   ├── chat/[id]/       # 聊天详情页
│   │   └── page.tsx         # 聊天主页
│   └── chatbot/             # Chatbot 页面
├── components/               # React 组件
│   ├── ai-elements/         # AI 相关组件
│   │   ├── message.tsx      # 消息组件
│   │   ├── code-block.tsx   # 代码块
│   │   └── ...              # 其他 AI 组件
│   ├── ui/                  # 基础 UI 组件
│   ├── app-sidebar.tsx      # 应用侧边栏
│   ├── chat-interface.tsx   # 聊天界面
│   ├── sidebar-history.tsx  # 历史记录侧边栏
│   └── ...                  # 其他组件
├── lib/                      # 核心库
│   ├── db/                  # 数据库相关
│   │   ├── index.ts         # 数据库连接
│   │   ├── schema.ts        # 数据库 Schema
│   │   ├── queries.ts       # 数据库查询
│   │   ├── migrate.ts       # 迁移脚本
│   │   └── migrations/      # 迁移文件
│   ├── auth.ts              # Better Auth 配置
│   ├── auth-client.ts       # 客户端认证
│   ├── errors.ts            # 错误处理
│   ├── types.ts             # 类型定义
│   └── utils.ts             # 工具函数
├── hooks/                    # React Hooks
├── public/                   # 静态资源
├── auth-schema.ts           # 认证数据库 Schema
├── drizzle.config.ts        # Drizzle 配置
└── package.json             # 项目配置
```

## 核心功能

### 1. AI 聊天

- **流式响应**：实时显示 AI 回复
- **思维链展示**：支持显示 AI 推理过程
- **代码高亮**：使用 Shiki 进行语法高亮
- **Markdown 渲染**：支持富文本消息
- **可恢复流**：使用 Redis 支持流式传输中断恢复
- **工具调用**：AI 可以调用多种工具来增强回复能力

#### AI 工具集成

本项目集成了多个实用工具，AI 可以根据用户需求自动调用相应的工具：

**1. 天气查询 (getWeather)**
- **功能**：获取指定城市或坐标的实时天气信息
- **数据源**：Open-Meteo API
- **支持输入**：
  - 城市名称（如：北京、San Francisco）
  - 经纬度坐标
- **返回信息**：当前温度、每小时温度预报、日出日落时间
- **使用示例**：
  - "北京今天天气怎么样？"
  - "查询一下纽约的天气"

**2. 热榜查询 (getHotNews)**
- **功能**：获取各大主流平台的实时热榜/热搜数据
- **数据源**：UapiPro API (https://uapis.cn)
- **支持平台**（40+）：
  - 视频/社区：bilibili、微博、知乎、抖音、快手等
  - 新闻/资讯：百度、今日头条、腾讯新闻等
  - 技术/IT：掘金、IT之家、CSDN等
  - 游戏：原神、崩坏3、星穹铁道等
  - 其他：微信读书、天气预警、地震速报等
- **返回信息**：热榜标题、热度值、原文链接、更新时间
- **使用示例**：
  - "给我看看微博热搜"
  - "查询知乎热榜"
  - "B站现在最火的是什么？"

**3. 每日新闻图 (getDailyNewsImage)**
- **功能**：一键生成今日新闻摘要图片
- **数据源**：UapiPro API
- **特点**：
  - 实时抓取各大平台热点新闻
  - 动态渲染成清晰美观的摘要图片
  - 支持下载和分享
- **适用场景**：早报、数字看板、应用首页
- **使用示例**：
  - "给我看看今天的新闻"
  - "显示每日新闻摘要"
  - "生成新闻早报"

**4. 随机图片 (getRandomImage)**
- **功能**：从海量图库中随机获取图片
- **数据源**：UapiPro API
- **支持分类**：
  - 福瑞 (furry)：z4k、szs8k、s4k、4k
  - 表情包 (bq)：有兽、熊猫、外国人、猫猫、ikun、二次元
  - 二次元 (acg)：PC端、移动端
  - AI绘画 (ai_drawing)
  - 动漫图 (general_anime)
  - 风景图 (landscape)
  - 手机壁纸 (mobile_wallpaper)
  - 电脑壁纸 (pc_wallpaper)
  - 混合动漫 (anime)
- **特点**：
  - 支持子类别筛选
  - 完全随机模式
  - 显示原图链接
  - 支持下载
- **使用示例**：
  - "给我一张随机图片"
  - "来一张二次元图片"
  - "显示一张风景壁纸"
  - "随机来张福瑞图"

#### 工具渲染架构

项目使用了统一的工具渲染架构，具有以下特点：

- **ToolRenderer 组件**：通用的工具渲染组件，支持所有工具
- **React.memo 优化**：避免不必要的重渲染，提升性能
- **类型安全**：完整的 TypeScript 类型定义
- **可扩展性**：添加新工具只需配置 ToolRenderer 即可
- **统一体验**：所有工具共享一致的 UI 风格

添加新工具只需三步：

```typescript
// 1. 创建工具定义 (lib/ai/tools/your-tool.ts)
export const yourTool = tool({
  description: "工具描述",
  inputSchema: z.object({...}),
  execute: async (input) => {...}
});

// 2. 注册到后端 (app/(chat)/api/chat/route.ts)
tools: { getWeather, getHotNews, getDailyNewsImage, getRandomImage, yourTool }

// 3. 添加前端渲染 (components/chat-interface.tsx)
case "tool-yourTool":
  return (
    <ToolRenderer
      key={`${message.id}-${i}`}
      part={part}
      addToolApprovalResponse={addToolApprovalResponse}
      renderOutput={(output) => <YourComponent data={output} />}
      deniedMessage="拒绝操作"
    />
  );
```

### 2. 用户认证

#### Better Auth UI（开箱即用）

Better Auth UI 提供了完整的认证界面组件，可以快速搭建登录、注册等页面：

- **预构建组件**：登录表单、注册表单、密码重置等
- **主题支持**：自动适配深色/浅色模式
- **国际化**：支持中文本地化
- **响应式设计**：适配移动端和桌面端

#### 自定义认证页面

如果需要更灵活的控制，可以使用 `authClient` 提供的方法自定义页面：

```typescript
import { authClient } from "@/lib/auth-client";

// 邮箱密码登录
await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});

// 用户名登录
await authClient.signIn.username({
  username: "myusername",
  password: "password123",
});

// OAuth 登录
await authClient.signIn.social({
  provider: "github",
});

// 注册新用户
await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});
```

**认证功能特性：**

- **邮箱密码登录**：传统认证方式
- **GitHub OAuth**：社交登录
- **会话管理**：基于 Better Auth
- **用户名支持**：可使用用户名登录
- **密码重置**：支持邮件找回密码
- **会话持久化**：自动维护登录状态

### 3. 聊天历史

- **自动分组**：按时间分组（今天、昨天、更早）
- **实时更新**：使用 React Hooks 自动刷新
- **删除功能**：支持单个聊天删除
- **分页加载**：支持大量历史记录

### 4. 数据库设计

#### 核心表结构

**Chat（聊天会话）**

```typescript
- id: UUID (主键)
- createdAt: Timestamp
- title: Text
- userId: Text (外键 -> User.id)
- visibility: Enum['public', 'private']
```

**Message_v2（消息）**

```typescript
- id: UUID (主键)
- chatId: UUID (外键 -> Chat.id, ON DELETE CASCADE)
- role: String
- parts: JSON
- attachments: JSON
- createdAt: Timestamp
```

**Stream（流式传输记录）**

```typescript
- id: UUID (主键)
- chatId: UUID (外键 -> Chat.id, ON DELETE CASCADE)
- createdAt: Timestamp
```

**级联删除**：删除 Chat 时，自动删除关联的 Message 和 Stream 记录。

## 可用脚本

### 开发

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint
```

### 数据库管理

```bash
# 测试数据库连接
pnpm db:test

# 生成迁移文件
pnpm db:generate

# 执行迁移
pnpm db:migrate

# 推送 schema 到数据库（开发环境）
pnpm db:push

# 从数据库拉取 schema
pnpm db:pull

# 检查迁移状态
pnpm db:check

# 打开 Drizzle Studio
pnpm db:studio
```

## API 接口

### POST /api/chat

创建新的聊天流式响应。

**请求体：**

```json
{
  "id": "chat-uuid",
  "messages": [
    {
      "role": "user",
      "parts": [{"type": "text", "text": "你好"}]
    }
  ],
  "model": "mimo-v2-flash"
}
```

**响应：** Server-Sent Events (SSE) 流

### GET /api/history

获取用户聊天历史。

**查询参数：**

- `limit`: 返回数量（默认 100）
- `startingAfter`: 分页游标
- `endingBefore`: 分页游标

**响应：**

```json
{
  "chats": [
    {
      "id": "uuid",
      "title": "聊天标题",
      "createdAt": "2024-01-01T00:00:00Z",
      "visibility": "private"
    }
  ],
  "hasMore": false
}
```

### DELETE /api/history?id={chatId}

删除指定聊天记录（包括关联的消息和流记录）。

**响应：**

```json
{
  "success": true
}
```

## 常见问题

### 1. 数据库连接失败

确保 `POSTGRES_URL` 环境变量配置正确，格式为：

```
postgresql://username:password@host:port/database
```

### 2. Redis 连接失败但不影响使用

 Redis 是可选的，用于流式响应恢复。如果未配置 `REDIS_URL`，系统会自动降级到不支持恢复的模式。

### 3. GitHub OAuth 配置

1. 在 GitHub Settings -> Developer settings -> OAuth Apps 创建应用
2. 设置 Authorization callback URL 为 `http://localhost:3000/api/auth/callback/github`
3. 将 Client ID 和 Client Secret 添加到 `.env`

### 4. 外键级联删除

当前项目使用数据库级联删除（`ON DELETE CASCADE`），删除 Chat 时会自动删除关联的 Message 和 Stream。如果遇到外键约束错误，请检查：

1. Schema 中是否正确配置了 `onDelete: "cascade"`
2. 是否执行了最新的数据库迁移
3. 数据库中的外键约束是否已更新

## 环境变量配置

确保在生产环境配置所有必需的环境变量：

- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- `POSTGRES_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`（改为生产域名）
