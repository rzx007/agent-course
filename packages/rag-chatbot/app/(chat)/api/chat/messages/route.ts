import { auth } from "@/lib/auth";
import { saveMessages } from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { NextResponse } from "next/server";

/**
 * 保存聊天消息的独立端点
 * 用于在流完成后保存 assistant 消息
 */
export async function POST(request: Request) {
  try {
    // 1. 验证用户身份
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 获取请求数据
    const { chatId, messages } = await request.json();

    if (!chatId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // 3. 保存消息到数据库
    await saveMessages({
      messages: messages.map((m) => ({
        id: generateUUID(),
        chatId,
        role: m.role,
        parts: m.parts,
        attachments: m.attachments || [],
        createdAt: new Date(),
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save messages:", error);
    return NextResponse.json(
      { error: "Failed to save messages" },
      { status: 500 }
    );
  }
}
