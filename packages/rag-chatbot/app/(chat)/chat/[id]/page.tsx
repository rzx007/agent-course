import { ChatHeader } from "@/components/chat-header";
import { ChatInterface } from "@/components/chat-interface";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";
import { redirect } from "next/navigation";

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

  const messagesFromDb = await getMessagesByChatId({ id });

  const uiMessages = convertToUIMessages(messagesFromDb);

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
