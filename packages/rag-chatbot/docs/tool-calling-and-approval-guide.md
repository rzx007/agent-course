# 工具调用与人工干预完整指南

本文档详细介绍如何在 AI SDK 中实现工具调用(Tool Calling)和人工干预(Tool Approval)功能。

## 目录

- [概述](#概述)
- [基础工具调用](#基础工具调用)
- [人工干预机制](#人工干预机制)
- [完整实现流程](#完整实现流程)
- [常见问题与解决方案](#常见问题与解决方案)
- [最佳实践](#最佳实践)

---

## 概述

### 什么是工具调用？

工具调用允许 AI 模型在生成回复时调用外部函数来获取实时数据或执行特定操作。例如：
- 查询天气信息
- 搜索数据库
- 调用第三方 API
- 执行计算任务

### 什么是人工干预？

人工干预(Tool Approval)是一种安全机制，在 AI 调用某些敏感工具前，需要用户明确批准。适用场景：
- 涉及费用的操作(如发送短信、购买商品)
- 访问敏感数据(如用户位置、联系人)
- 执行不可逆操作(如删除文件、发送邮件)

---

## 基础工具调用

### 1. 定义工具

创建文件 `lib/ai/tools/get-weather.ts`:

```typescript
import { tool } from "ai";
import { z } from "zod";

export const getWeather = tool({
  description: "Get the current weather at a location",
  inputSchema: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    city: z
      .string()
      .describe("City name (e.g., 'San Francisco', 'New York')")
      .optional(),
  }),
  needsApproval: false, // 是否需要人工审批
  execute: async (input) => {
    // 实现天气查询逻辑
    let latitude: number;
    let longitude: number;

    if (input.city) {
      // 将城市名转换为经纬度
      const coords = await geocodeCity(input.city);
      if (!coords) {
        return { error: `无法找到城市 "${input.city}"` };
      }
      latitude = coords.latitude;
      longitude = coords.longitude;
    } else if (input.latitude && input.longitude) {
      latitude = input.latitude;
      longitude = input.longitude;
    } else {
      return { error: "请提供城市名或经纬度" };
    }

    // 调用天气 API
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
    );
    
    const weatherData = await response.json();
    return weatherData;
  },
});
```

### 2. 服务端集成

在 API 路由中使用工具(`app/(chat)/api/chat/route.ts`):

```typescript
import { streamText } from "ai";
import { getWeather } from "@/lib/ai/tools/get-weather";

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: deepseek.chat("mimo-v2-flash"),
    messages: await convertToModelMessages(messages),
    tools: {
      getWeather, // 注册工具
    },
  });

  return result.toUIMessageStreamResponse();
}
```

### 3. 客户端渲染

在聊天界面渲染工具调用结果(`components/chat-interface.tsx`):

```typescript
{message.parts.map((part, i) => {
  switch (part.type) {
    case "tool-getWeather":
      if (part.state === "output-available") {
        return (
          <Weather 
            key={part.toolCallId} 
            weatherAtLocation={part.output} 
          />
        );
      }
      break;
    // ... 其他 part 类型
  }
})}
```

---

## 人工干预机制

### 1. 启用工具审批

在工具定义中设置 `needsApproval: true`:

```typescript
export const getWeather = tool({
  description: "Get the current weather at a location",
  inputSchema: z.object({
    city: z.string(),
  }),
  needsApproval: true, // ✅ 启用人工审批
  execute: async (input) => {
    // ... 执行逻辑
  },
});
```

### 2. 客户端配置

使用 `useChat` hook 并配置自动发送条件:

```typescript
import { useChat } from "@ai-sdk/react";
import { 
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses 
} from "ai";

const {
  messages,
  sendMessage,
  addToolApprovalResponse,
} = useChat({
  id: chatId,
  transport: new DefaultChatTransport({
    api: "/api/chat",
  }),
  // 关键：只在所有审批完成后自动继续
  sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
});
```

### 3. 渲染审批 UI

展示工具调用并提供批准/拒绝按钮:

```typescript
case "tool-getWeather":
  const { toolCallId, state } = part;
  const approvalId = part.approval?.id;

  // 等待用户审批
  if (state === "approval-requested" && approvalId) {
    return (
      <Tool key={toolCallId} defaultOpen={true}>
        <ToolHeader state={state} type="tool-getWeather" />
        <ToolContent>
          <ToolInput input={part.input} />
          <div className="flex gap-2">
            <button
              onClick={() => {
                addToolApprovalResponse({
                  id: approvalId,
                  approved: false,
                  reason: "用户拒绝",
                });
              }}
            >
              拒绝
            </button>
            <button
              onClick={() => {
                addToolApprovalResponse({
                  id: approvalId,
                  approved: true,
                });
              }}
            >
              允许
            </button>
          </div>
        </ToolContent>
      </Tool>
    );
  }

  // 用户已批准，等待结果
  if (state === "approval-responded") {
    return (
      <Tool key={toolCallId}>
        <ToolHeader state={state} type="tool-getWeather" />
        <ToolContent>
          <ToolInput input={part.input} />
          <div>等待结果...</div>
        </ToolContent>
      </Tool>
    );
  }

  // 显示最终结果
  if (state === "output-available") {
    return <Weather weatherAtLocation={part.output} />;
  }

  // 用户拒绝
  if (state === "output-denied") {
    return (
      <Tool key={toolCallId}>
        <ToolHeader state="output-denied" type="tool-getWeather" />
        <ToolContent>
          <div>天气查询已被拒绝</div>
        </ToolContent>
      </Tool>
    );
  }
  break;
```

---

## 完整实现流程

### 工具状态生命周期

```
1. AI 请求调用工具
   ↓
   state: "approval-requested"
   显示：批准/拒绝按钮

2. 用户点击"允许"
   ↓
   调用 addToolApprovalResponse({ approved: true })
   ↓
   state: "approval-responded"
   显示：等待中...

3. 工具执行完成
   ↓
   state: "output-available"
   显示：工具结果

---

如果用户点击"拒绝"
   ↓
   调用 addToolApprovalResponse({ approved: false })
   ↓
   state: "output-denied"
   显示：操作已取消
```

### 消息存储策略

```typescript
onFinish: async ({ messages: finishedMessages }) => {
  for (const finishedMsg of finishedMessages) {
    const existingMsg = messages.find(
      (m) => m.id === finishedMsg.id
    );
    
    if (existingMsg) {
      // 更新已存在的消息（工具状态已改变）
      await updateMessage({
        id: finishedMsg.id,
        parts: finishedMsg.parts,
      });
    } else {
      // 保存新消息
      await saveMessages({
        messages: [{
          id: finishedMsg.id,
          role: finishedMsg.role,
          parts: finishedMsg.parts,
          chatId: id,
          createdAt: new Date(),
          attachments: [],
        }],
      });
    }
  }
}
```

---

## 常见问题与解决方案

### 问题 1: `onFinish` 与 `needsApproval` 冲突

**症状：**
```
Error: failed to pipe response
Error: no tool invocation found for tool call
```

**原因：**  
这是 AI SDK v6 的已知 bug ([GitHub Issue #10169](https://github.com/vercel/ai/issues/10169))。当在 `createUIMessageStream` 中使用 `onFinish` 回调，且工具设置了 `needsApproval: true` 时，流会无限等待。

**解决方案：**
1. **方案 1**：禁用 `needsApproval`
```typescript
needsApproval: false, // 临时禁用
```

2. **方案 2**：使用更新策略而非重复插入
```typescript
onFinish: async ({ messages: finishedMessages }) => {
  // 检查消息是否存在，存在则更新，不存在则插入
  for (const msg of finishedMessages) {
    const existing = await findMessage(msg.id);
    if (existing) {
      await updateMessage(msg.id, msg.parts);
    } else {
      await insertMessage(msg);
    }
  }
}
```

### 问题 2: 数据库主键冲突

**症状：**
```
重复键违反唯一约束 "Message_v2_pkey"
键值 "(id)=(H463gG0eriUkIZQ0)" 已经存在
```

**原因：**  
使用 AI SDK 的 `m.id`(短 ID)作为数据库主键，而不是生成新的 UUID。

**解决方案：**
```typescript
// ❌ 错误：直接使用 m.id
await saveMessages({
  messages: messages.map((m) => ({
    id: m.id, // 这是短 ID，会冲突
    ...
  }))
});

// ✅ 正确：使用 generateUUID()
await saveMessages({
  messages: messages.map((m) => ({
    id: generateUUID(), // 生成新的 UUID
    ...
  }))
});

// ✅ 或者：保持使用 m.id，但实现更新逻辑
if (existingMessage) {
  await updateMessage({ id: m.id, parts: m.parts });
} else {
  await insertMessage({ id: m.id, ... });
}
```

### 问题 3: 刷新后工具状态丢失

**症状：**
```
Cannot read properties of undefined (reading 'state')
```

**原因：**  
从数据库恢复的消息缺少 `state` 属性。

**解决方案：**  
添加防御性检查：

```typescript
case "tool-getWeather":
  // 防御性检查
  if (!part || typeof part !== 'object') {
    return null;
  }
  
  const { state } = part;
  
  // 如果没有 state 但有 output，直接显示结果（数据库恢复的消息）
  if (!state && part.output) {
    return <Weather weatherAtLocation={part.output} />;
  }
  
  // 如果没有 state 也没有 output，跳过
  if (!state) {
    return null;
  }
  
  // 正常处理各种 state
  // ...
```

### 问题 4: React 对象渲染错误

**症状：**
```
Objects are not valid as a React child (found: object with keys {...})
```

**原因：**  
试图直接渲染对象而不是字符串/组件。

**解决方案：**
```typescript
// ❌ 错误：直接渲染对象
<div>{part.output}</div>

// ✅ 正确：使用组件渲染
<Weather weatherAtLocation={part.output as WeatherAtLocation} />

// ✅ 或者：转换为字符串
<div>{JSON.stringify(part.output)}</div>
```

---

## 最佳实践

### 1. 工具设计原则

- **单一职责**：每个工具只做一件事
- **明确描述**：description 要清晰，帮助 AI 理解何时使用
- **输入验证**：使用 Zod schema 严格验证输入
- **错误处理**：返回友好的错误信息而不是抛出异常

```typescript
export const getWeather = tool({
  description: "获取指定城市的实时天气信息。适用于用户询问天气、温度、气候等问题。",
  inputSchema: z.object({
    city: z.string().min(1).describe("城市名称，例如：北京、上海、New York"),
  }),
  execute: async (input) => {
    try {
      // 实现逻辑
      const result = await fetchWeather(input.city);
      return result;
    } catch (error) {
      // 返回错误而不是抛出
      return {
        error: `无法获取 ${input.city} 的天气信息：${error.message}`
      };
    }
  },
});
```

### 2. 审批策略

| 场景 | needsApproval | 说明 |
|------|---------------|------|
| 查询公开数据 | false | 天气、汇率等无风险操作 |
| 访问用户数据 | true | 位置、联系人等敏感信息 |
| 消耗资源 | true | 发送短信、调用付费 API |
| 不可逆操作 | true | 删除、发送邮件等 |

### 3. 消息持久化

```typescript
// 推荐：区分首次插入和状态更新
onFinish: async ({ messages: finishedMessages }) => {
  for (const msg of finishedMessages) {
    if (msg.role === "assistant") {
      const existing = messages.find(m => m.id === msg.id);
      
      if (existing) {
        // 工具状态更新：只更新 parts
        await updateMessage({
          id: msg.id,
          parts: msg.parts,
        });
      } else {
        // 新消息：完整插入
        await saveMessages({
          messages: [{
            id: msg.id,
            chatId: id,
            role: msg.role,
            parts: msg.parts,
            attachments: [],
            createdAt: new Date(),
          }],
        });
      }
    }
  }
}
```

### 4. UI/UX 设计

**加载状态**
```typescript
{state === "approval-requested" && <Spinner />}
{state === "approval-responded" && <LoadingMessage />}
```

**清晰的操作提示**
```typescript
<ToolHeader>
  <AlertIcon />
  <span>AI 想要查询天气信息</span>
</ToolHeader>
<ToolContent>
  <p>城市：{part.input.city}</p>
  <p>这将调用第三方天气 API</p>
</ToolContent>
```

**视觉反馈**
- 待审批：黄色边框 + 闪烁动画
- 已批准：绿色边框
- 已拒绝：红色边框 + 删除线

### 5. 类型安全

定义工具输出类型：

```typescript
// types.ts
export type WeatherAtLocation = {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
  };
  // ... 其他字段
};

// 工具定义
export const getWeather = tool<WeatherAtLocation>({
  // ...
  execute: async (input): Promise<WeatherAtLocation> => {
    // 返回类型安全
  },
});

// 组件使用
<Weather weatherAtLocation={part.output as WeatherAtLocation} />
```

---

## 完整示例项目结构

```
packages/rag-chatbot/
├── lib/ai/tools/
│   ├── get-weather.ts          # 天气工具定义
│   └── index.ts                # 工具导出
├── app/(chat)/api/chat/
│   ├── route.ts                # 主聊天 API（工具注册）
│   └── messages/route.ts       # 消息保存 API
├── components/
│   ├── chat-interface.tsx      # 主聊天界面（工具渲染）
│   ├── weather.tsx             # 天气组件（工具结果展示）
│   └── ai-elements/
│       ├── tool.tsx            # 工具 UI 组件
│       ├── tool-header.tsx
│       └── tool-input.tsx
└── docs/
    └── tool-calling-and-approval-guide.md  # 本文档
```

---

## 参考资料

- [AI SDK 官方文档 - Tool Calling](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage)
- [AI SDK GitHub - Tool Approval Issue](https://github.com/vercel/ai/issues/10169)
- [Vercel AI SDK 6 发布公告](https://vercel.com/blog/ai-sdk-6)
- [Next.js App Router 文档](https://nextjs.org/docs/app)

---

## 更新日志

- **2026-01-10**: 初始版本，包含完整的工具调用和人工干预指南
