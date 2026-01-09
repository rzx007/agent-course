import { Bot, MessageCircle } from "lucide-react";

export const Greeting = () => {
  return (
    <div className="h-full pt-4">
      <div className="w-full mx-auto max-w-3xl px-4 text-center leading-8">
        <p className="flex items-center justify-center gap-x-3 mb-5">
          <Bot className="size-10" /> + <MessageCircle className="size-10" />
        </p>

        <p>使用 Nextjs + Shadcn/ui + AI SDK 支持会话流恢复的聊天机器人模板。</p>
        <p>在客户端使用 &quot;useChat&quot; 钩子，以创建无缝的聊天体验。</p>
      </div>
    </div>
  );
};
