import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteMessageById, getChatById } from "@/lib/db/queries";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("id");
    const chatId = searchParams.get("chatId");

    if (!messageId || !chatId) {
      return NextResponse.json(
        { error: "Message ID and Chat ID are required" },
        { status: 400 }
      );
    }

    // 验证用户权限
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证聊天归属
    const chat = await getChatById({ id: chatId });
    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 }
      );
    }

    // 删除消息
    await deleteMessageById({ id: messageId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
