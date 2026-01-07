# Next.js 集成 Better Auth + Drizzle ORM + PostgreSQL + Better Auth UI 完整指南

本文档详细说明如何在 Next.js 项目中集成 Better Auth 认证系统，使用 Drizzle ORM 作为数据库适配器，连接 PostgreSQL 数据库，并使用 Better Auth UI 提供开箱即用的认证界面。

## 目录

1. [前置准备](#前置准备)
2. [第一步：配置 Drizzle ORM + PostgreSQL](#第一步配置-drizzle-orm--postgresql)
3. [第二步：集成 Better Auth](#第二步集成-better-auth)
4. [第三步：客户端集成](#第三步客户端集成)
5. [第四步：路由保护](#第四步路由保护)
6. [第五步：集成 Better Auth UI](#第五步集成-better-auth-ui)
7. [常见问题](#常见问题)

---

## 前置准备

### 运行环境要求

- **Node.js**: 18+
- **pnpm**: 10+
- **PostgreSQL**: 需要运行中的 PostgreSQL 数据库

### 技术栈版本

- **Next.js**: 16.1.1
- **React**: 19.2.3
- **Drizzle ORM**: ^0.45.1
- **PostgreSQL 驱动**: `postgres` (^3.4.7)
- **Better Auth**: ^1.4.10
- **Better Auth UI**: ^3.3.12

### 准备环境变量

在项目根目录创建 `.env` 文件：

```env
# 数据库连接（必需）
POSTGRES_URL=postgresql://username:password@localhost:5432/database_name

# GitHub OAuth（可选，用于第三方登录）
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

> **注意**：确保 PostgreSQL 服务已启动，并且数据库已创建。

---

## 第一步：配置 Drizzle ORM + PostgreSQL

> **为什么先配置 Drizzle？**
> Better Auth 使用 Drizzle Adapter 来操作数据库，所以必须先建立好 Drizzle 和 PostgreSQL 的连接。

### 1. 安装 Drizzle 相关依赖

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

### 2. 创建数据库客户端 (`lib/db/index.ts`)

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// 从环境变量读取数据库连接 URL
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);
```

> **重要**：确保环境变量 `POSTGRES_URL` 已正确配置。

### 3.创建业务表 (lib/db/schema.ts)

```typescript
import type { InferSelectModel } from "drizzle-orm";
import {
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";


export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// 其他业务表
```

### 4. 配置 Drizzle Kit (`drizzle.config.ts`)

```typescript
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: ".env",
});

export default defineConfig({
  // schema 数组包含所有表定义文件
  // auth-schema.ts 将在后续步骤由 Better Auth CLI 生成
  schema: ["./lib/db/schema.ts", "./auth-schema.ts"],
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL || "",
  },
});
```

### 5. 测试数据库连接（推荐）

在继续之前，建议先测试数据库连接是否正常：

创建 `lib/db/test-connection.ts`：

```typescript
import { db } from "./index";
import postgres from "postgres";

async function testConnection() {
  try {
    const sql = postgres(process.env.POSTGRES_URL!);
    await sql`SELECT 1`;
    console.log("✅ Database connection successful!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();
```

在 `package.json` 中添加测试脚本：

```json
{
  "scripts": {
    "db:test": "npx tsx lib/db/test-connection.ts"
  }
}
```

运行测试：

```bash
pnpm db:test
```

如果看到 ✅ 表示数据库连接成功，可以继续下一步。

---

## 第二步：集成 Better Auth

> **为什么现在配置 Better Auth？**
> Drizzle 已经配置好了，现在可以让 Better Auth 使用 Drizzle Adapter 来管理认证数据。

### 1. 安装 Better Auth

```bash
pnpm add better-auth
```

### 2. 创建服务端 Auth 实例 (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "../auth-schema";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
});
```

> **注意**：此时 `auth-schema` 还不存在，这是正常的。我们会在下一步生成它。

### 3. 使用 Better Auth CLI 生成 Schema

**重要：不要手动创建 `auth-schema.ts`！**

Better Auth CLI 会根据你的 `lib/auth.ts` 配置自动生成所需的数据表结构：

```bash
pnpm dlx @better-auth/cli generate
```

这个命令会：

1. 分析你的 Better Auth 配置（从 `lib/auth.ts`）
2. 自动生成 `auth-schema.ts` 文件，包含所有必需的表结构：
   - `user` - 用户表
   - `session` - 会话表
   - `account` - 账户表（用于 OAuth）
   - `verification` - 验证表（用于邮箱验证等）
3. 根据你启用的插件自动添加额外的表结构
4. 包含完整的 Drizzle ORM schema 定义（表结构、索引、关系等）

**注意事项：**

- 每次修改 Better Auth 配置（如添加新插件）后，都需要重新运行 `generate` 命令
- 生成的文件可以提交到版本控制系统
- 如果需要自定义表结构，应该在自己的 schema 文件中扩展

### 4. 更新业务表与用户表的关联

现在 `auth-schema.ts` 已生成，回到 `lib/db/schema.ts` 添加外键关联：

```typescript
import type { InferSelectModel } from "drizzle-orm";
import {
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// 导入 Better Auth 生成的 user 表
import { user } from "../../auth-schema";
export { user };

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id), // 现在可以添加外键了
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
});

// ... 其他表定义
```

### 5. 生成并执行数据库迁移

现在所有 schema 都准备好了，生成迁移文件：

```bash
pnpm db:generate
```

在 `package.json` 中添加迁移脚本（如果还没有）：

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "npx tsx lib/db/migrate.ts",
    "db:studio": "drizzle-kit studio"
  }
}
```

创建迁移执行脚本 `lib/db/migrate.ts`：

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env" });

const sql = postgres(process.env.POSTGRES_URL!, { max: 1 });
const db = drizzle(sql);

async function main() {
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  console.log("Migrations complete!");
  await sql.end();
}

main();
```

执行迁移：

```bash
pnpm db:migrate
```

### 6. 创建 API 路由 (`app/(auth)/api/auth/[...all]/route.ts`)

这是 Better Auth 的核心 API 端点：

```typescript
import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

function addCorsHeaders(url: URL, headers: Headers) {
  if (
    process.env.NODE_ENV === "development" &&
    [
      "/api/auth/oauth2/token",
      "/api/auth/oauth2/userinfo",
      "/api/auth/oauth2/register",
    ].includes(url.pathname)
  ) {
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "authorization, content-type");
    headers.set(
      "Cache-Control",
      "public, max-age=15, stale-while-revalidate=15, stale-if-error=86400"
    );
  }
}

// CORS wrapper for development
function withCors(handler: Function) {
  return async (req: Request) => {
    const res = await handler(req);
    addCorsHeaders(new URL(req.url), res.headers);
    return res;
  };
}

const handler = toNextJsHandler(auth);

export const GET = withCors(handler.GET);
export const POST = withCors(handler.POST);

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  const headers = new Headers();
  addCorsHeaders(new URL(req.url), headers);
  return new NextResponse(null, {
    headers,
  });
}
```

---

## 第三步：客户端集成

> **为什么现在配置客户端？**
> 服务端 Better Auth 已经配置好，现在需要在客户端调用认证 API。

### 1. 创建客户端 Auth Client (`lib/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({});
export const { signIn, signUp, useSession } = createAuthClient();
```

> **注意**：这里只创建客户端实例，Provider 的配置会在第五步（Better Auth UI）中进行。

---

## 第四步：路由保护

> **为什么现在配置路由保护？**
> 认证系统已经可以工作了，现在需要保护需要登录才能访问的页面。

### 方式一：Middleware 保护（体验优化）

创建 `proxy.ts`（或直接在 `middleware.ts` 中实现）：

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set(
      "redirectTo",
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/chat/:path*"], // 需要保护的路由
} as const;
```

然后在 `middleware.ts` 中导出：

```typescript
export { proxy as middleware, config } from "./proxy";
```

### 方式二：服务端 Layout 保护（真正安全）

在需要保护的路由组 Layout 中添加检查（例如 `app/(chat)/layout.tsx`）：

```typescript
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (!session) {
    // 未登录，服务端直接重定向
    redirect("/auth/sign-in");
  }

  return <>{children}</>;
}
```

**重要说明：**

- **Middleware 保护**：提供快速的客户端拦截，提升用户体验，但不应作为唯一的安全措施。
- **服务端 Layout/Page 保护**：真正的安全保护层，服务器端检查，确保页面内容不会被未授权访问。
- **最佳实践**：同时使用两者，Middleware 用于 UX 优化，Server Components 用于真正的安全保护。

---

## 第五步：集成 Better Auth UI

> **为什么最后集成 UI？**
> Better Auth UI 依赖前面配置的所有功能（认证 API、客户端、路由保护）。现在基础功能都就绪了，可以添加美观的 UI 界面。

> **💡 提示：Better Auth UI 是可选的！**
>
> Better Auth UI 提供了开箱即用的认证界面组件，可以快速搭建登录、注册等页面。
>
> **如果你想自定义界面**，可以跳过本步骤，直接使用 `authClient` 提供的方法（如 `signIn`、`signUp`、`signOut` 等）来构建自己的 UI 组件。
>
> 例如，自定义登录表单：
>
> ```typescript
> import { authClient } from '@/lib/auth-client';
> 
> async function handleLogin(email: string, password: string) {
>   const { data, error } = await authClient.signIn.email({
>     email,
>     password,
>   });
>   
>   if (error) {
>     console.error('Login failed:', error);
>     return;
>   }
>   
>   // 登录成功，跳转到主页
>   router.push('/dashboard');
> }
> ```
>
> **本文档选择使用 Better Auth UI**，因为它能快速实现完整的认证流程，减少开发时间。

### 1. 安装 Better Auth UI

```bash
pnpm add @daveyplate/better-auth-ui
```

### 2. 配置 Providers (`app/providers.tsx`)

创建 Provider 组件，使用 Better Auth UI 提供的 `AuthUIProvider`：

```typescript
"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => {
        // 清除路由缓存（用于受保护的路由）
        router.refresh();
      }}
      Link={Link}
    >
      {children}
    </AuthUIProvider>
  );
}
```

### 3. 在根布局中使用 (`app/layout.tsx`)

```typescript
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 4. 创建认证页面路由

Better Auth UI 提供了开箱即用的认证界面。

#### 创建 `app/(auth)/auth/[path]/page.tsx`

```typescript
import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6">
      <AuthView path={path} />
    </main>
  );
}
```

### 5. 创建账户管理页面（可选）

#### `app/(auth)/account/[path]/page.tsx`

```typescript
import { AccountView } from "@daveyplate/better-auth-ui";
import { accountViewPaths } from "@daveyplate/better-auth-ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="container p-4 md:p-6">
      <AccountView path={path} />
    </main>
  );
}
```

### 6. 创建组织管理页面（可选）

#### `app/(auth)/organization/[path]/page.tsx`

```typescript
import { OrganizationView } from "@daveyplate/better-auth-ui";
import { organizationViewPaths } from "@daveyplate/better-auth-ui/server";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(organizationViewPaths).map((path) => ({ path }));
}

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <main className="container p-4 md:p-6">
      <OrganizationView path={path} />
    </main>
  );
}
```

### 7. 可用的认证路由

Better Auth UI 会自动生成以下路由：

- `/auth/sign-in` - 登录页面
- `/auth/sign-up` - 注册页面
- `/auth/forgot-password` - 忘记密码
- `/auth/reset-password` - 重置密码
- `/account/profile` - 个人资料
- `/account/security` - 安全设置
- `/organization/create` - 创建组织
- `/organization/[id]` - 组织详情

---

## 常见问题

### 1. 如何在客户端组件中获取用户信息？

```typescript
"use client";
import { useSession } from "@/lib/auth-client";

export default function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not logged in</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

### 2. 如何在服务端组件中获取用户信息？

```typescript
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function ServerComponent() {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (!session) return <div>Not logged in</div>;

  return <div>Welcome, {session.user.name}!</div>;
}
```

### 3. 如何在 API 路由中获取用户信息？

```typescript
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}
```

### 4. 如何自定义认证页面样式？

Better Auth UI 支持通过 Tailwind CSS 进行样式定制。你可以：

1. 覆盖默认的 CSS 类
2. 使用自定义主题
3. 完全自定义组件（不使用 Better Auth UI，直接调用 `authClient` API）

### 5. 数据库连接错误

确保：

- PostgreSQL 服务正在运行
- `POSTGRES_URL` 环境变量配置正确
- 数据库用户有足够的权限
- 防火墙允许数据库连接

测试连接：

```typescript
// lib/db/test-connection.ts
import { db } from "./index";

async function testConnection() {
  try {
    await db.execute("SELECT 1");
    console.log("✅ Database connection successful!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
  process.exit(0);
}

testConnection();
```

运行：

```bash
npx tsx lib/db/test-connection.ts
```

### 6. 如何实现登录后重定向？

在登录成功后，使用 `redirectTo` 参数：

```typescript
"use client";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const redirectTo = searchParams.get("redirectTo") || "/";

  useEffect(() => {
    if (session) {
      router.push(redirectTo);
    }
  }, [session, redirectTo, router]);

  return null;
}
```

### 7. Schema 表已存在的错误

如果数据库中已经有相同名称的表，迁移会失败。解决方案：

1. 删除旧表（谨慎！会丢失数据）
2. 修改 schema 中的表名
3. 使用 Drizzle 的 `push` 模式而不是 `migrate`：

```bash
pnpm db:push
```

---

## 项目结构参考

```
packages/rag-chatbot/
├── app/
│   ├── (auth)/
│   │   ├── api/auth/[...all]/route.ts  # Better Auth API 端点
│   │   ├── auth/[path]/page.tsx         # 认证页面
│   │   ├── account/[path]/page.tsx      # 账户管理
│   │   └── organization/[path]/page.tsx # 组织管理
│   ├── (chat)/
│   │   ├── layout.tsx                   # 带认证保护的 Layout
│   │   └── page.tsx                     # 聊天页面
│   ├── layout.tsx                       # 根 Layout
│   └── providers.tsx                    # Auth UI Provider
├── lib/
│   ├── db/
│   │   ├── migrations/                  # 数据库迁移文件
│   │   ├── index.ts                     # 数据库客户端
│   │   ├── migrate.ts                   # 迁移脚本
│   │   └── schema.ts                    # 业务数据表
│   ├── auth.ts                          # Better Auth 服务端
│   └── auth-client.ts                   # Better Auth 客户端
├── auth-schema.ts                       # 认证相关表结构
├── drizzle.config.ts                    # Drizzle 配置
├── proxy.ts                             # Middleware 逻辑
├── middleware.ts                        # Next.js Middleware
└── package.json
```

---

## 完整的初始化流程总结

按照正确的依赖顺序，完整的初始化流程如下：

```bash
# ========================================
# 第一步：配置 Drizzle ORM + PostgreSQL
# ========================================

# 1.1 安装 Drizzle 依赖
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# 1.2 配置环境变量（编辑 .env 文件）
# POSTGRES_URL=postgresql://username:password@localhost:5432/database_name

# 1.3 创建以下文件：
# - lib/db/index.ts （数据库客户端）
# - lib/db/schema.ts （业务表定义）
# - drizzle.config.ts （Drizzle 配置）
# - lib/db/test-connection.ts （连接测试脚本）

# 1.4 测试数据库连接
pnpm db:test

# ========================================
# 第二步：集成 Better Auth
# ========================================

# 2.1 安装 Better Auth
pnpm add better-auth

# 2.2 创建 lib/auth.ts（Better Auth 配置）

# 2.3 使用 Better Auth CLI 生成 auth-schema.ts
pnpm dlx @better-auth/cli generate

# 2.4 更新 lib/db/schema.ts 添加与 user 表的外键关联

# 2.5 生成数据库迁移文件
pnpm db:generate

# 2.6 执行数据库迁移
pnpm db:migrate

# 2.7 创建 API 路由：app/(auth)/api/auth/[...all]/route.ts

# ========================================
# 第三步：客户端集成
# ========================================

# 3.1 创建 lib/auth-client.ts（客户端 Auth Client）
# 注意：Providers 的配置属于 Better Auth UI，会在第五步进行

# ========================================
# 第四步：路由保护
# ========================================

# 4.1 创建 proxy.ts 和 middleware.ts（Middleware 保护）

# 4.2 在受保护的 layout 中添加服务端检查（如 app/(chat)/layout.tsx）

# ========================================
# 第五步：集成 Better Auth UI
# ========================================

# 5.1 安装 Better Auth UI
pnpm add @daveyplate/better-auth-ui

# 5.2 配置 app/providers.tsx（使用 AuthUIProvider）

# 5.3 在 app/layout.tsx 中使用 Providers

# 5.4 创建认证页面路由：
# - app/(auth)/auth/[path]/page.tsx
# - app/(auth)/account/[path]/page.tsx（可选）
# - app/(auth)/organization/[path]/page.tsx（可选）

# ========================================
# 完成！启动开发服务器
# ========================================
pnpm dev
```

### 关键依赖关系

```
Drizzle ORM + PostgreSQL (基础层)
         ↓
   Better Auth (认证层，使用 Drizzle Adapter)
         ↓
   Auth Client (客户端调用 Better Auth)
         ↓
   路由保护 (Middleware + Server Components)
         ↓
   Better Auth UI (界面层：包含 AuthUIProvider + 认证页面)
```

## 总结

通过以上步骤，你已经完成了：

1. ✅ Better Auth + Drizzle ORM + PostgreSQL 的完整集成
2. ✅ 使用 CLI 自动生成认证 Schema（而非手动创建）
3. ✅ 邮箱密码登录和 GitHub OAuth 登录
4. ✅ 使用 Better Auth UI 的开箱即用认证界面
5. ✅ Middleware 和服务端双重路由保护
6. ✅ 数据库迁移和管理

现在你的 Next.js 应用已经具备完善的认证系统！

## 参考资料

- [Better Auth 官方文档](https://better-auth.com)
- [Drizzle ORM 官方文档](https://orm.drizzle.team)
- [Better Auth UI 文档](https://github.com/daveyplate/better-auth-ui)
- [Next.js 官方文档](https://nextjs.org/docs)
