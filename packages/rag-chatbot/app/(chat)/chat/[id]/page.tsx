import { ChatHeader } from "@/components/chat-header";
import { ChatInterface } from "@/components/chat-interface";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";
import { redirect } from "next/navigation";
import type { ChatMessage } from "@/lib/types";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ChatPage = async ({ params }: ChatPageProps) => {
  const { id } = await params;

  const chat = await getChatById({ id });

  if (!chat) {
    redirect("/");
  }

  let uiMessages: ChatMessage[] = [];
  try {
    const messagesFromDb = await getMessagesByChatId({ id });
    
    // 确保 messagesFromDb 是数组
    if (Array.isArray(messagesFromDb)) {
      uiMessages = convertToUIMessages(messagesFromDb);
    } else {
      console.error('getMessagesByChatId returned non-array:', messagesFromDb);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    // 发生错误时使用空数组
  }

  return (
    <div className="relative size-full h-screen">
      <ChatHeader chatId="" isReadonly={false} />
      <div className="flex flex-col h-[calc(100%-50px)]">
        <ChatInterface id={chat.id} initialMessages={uiMessages} />
      </div>
    </div>
  );
};
export default ChatPage;
