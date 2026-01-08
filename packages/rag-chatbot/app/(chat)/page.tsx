"use client";
import { Greeting } from "@/components/greeting";
import { ChatHeader } from "@/components/chat-header";
import { ChatInterface } from "@/components/chat-interface";
import { generateUUID } from "@/lib/utils";

const ChatBotDemo = () => {
  const id = generateUUID();
  return (
    <div className="relative size-full h-screen">
      <ChatHeader chatId="" isReadonly={false} />
      <div className="flex flex-col h-[calc(100%-50px)]">
        <ChatInterface
          showGreeting
          greetingComponent={<Greeting />}
          id={id}
          initialMessages={[]}
          key={id}
        />
      </div>
    </div>
  );
};
export default ChatBotDemo;
