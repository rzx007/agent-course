import { createUIMessageStream, JsonToSseTransformStream } from "ai";
import { differenceInSeconds } from "date-fns";
import {
  getMessagesByChatId,
  getStreamIdsByChatId,
  getChatById,
} from "@/lib/db/queries";
import { getStreamContext } from "../../route";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chatId } = await params;
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  // 1. 基础校验
  if (!streamContext) return new Response(null, { status: 204 });
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  // 2. 获取该聊天对应的最新 Stream ID
  const streamIds = await getStreamIdsByChatId({ chatId });
  const recentStreamId = streamIds.at(-1);
  if (!recentStreamId) return new Response(null, { status: 204 });

  // 3. 【关键逻辑】使用 Flag 检测 Redis 是否未命中
  let isRedisMissed = false;

  const emptyDataStream = createUIMessageStream({
    execute: () => {}, // 一个什么都不做的流, 也可以添加其他的逻辑
  });

  //   new ReadableStream()
  const stream = await streamContext.resumableStream(recentStreamId, () => {
    // 如果这个回调被执行了，说明 Redis 里找不到活跃流（可能生成完了，也可能过期了）
    isRedisMissed = true;
    return emptyDataStream.pipeThrough(new JsonToSseTransformStream());
  });

  // 4. 【核心判断】如果 stream 是 null（已完成）或者 触发了回调（找不到 ID）
  if (stream === null || isRedisMissed) {
    const messages = await getMessagesByChatId({ id: chatId });
    const lastAssistantMsg = messages.at(-1);

    // 兜底逻辑：如果数据库里有一条“非常新鲜”的回复，说明流刚断，补发给前端
    if (
      lastAssistantMsg?.role === "assistant" &&
      differenceInSeconds(
        resumeRequestedAt,
        new Date(lastAssistantMsg.createdAt)
      ) < 15
    ) {
      const restoredStream = createUIMessageStream({
        execute: ({ writer }) => {
          writer.write({
            type: "data-appendMessage", // 配合 useChat 的 onData 处理
            data: JSON.stringify(lastAssistantMsg),
            transient: true,
          });
        },
      });

      return new Response(
        restoredStream.pipeThrough(new JsonToSseTransformStream()),
        { headers: { "Content-Type": "text/event-stream" } }
      );
    }

    // 确实没流了，返回 204 让前端停止 loading
    return new Response(null, { status: 204 });
  }

  // 5. 命中 Redis，返回正在进行的流
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
/**
 * 状态 A (命中活跃流)：Redis 发现流还在跑。返回 ReadableStream。!stream 为假，直接返回给前端，对话继续。
 * 状态 B (流已完成)：Redis 发现 ID 存在，但标记为 done。根据文档，此时返回 null。!stream 为真，触发数据库补丁逻辑 (data-appendMessage)。
 * 状态 C (流 ID 不存在)：Redis 里找不到这个 ID（可能过期了，或者还没存进去）。此时会执行 makeStream 匿名函数。返回的是你定义的那个 emptyDataStream。
 */
