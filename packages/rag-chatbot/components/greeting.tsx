import { Bot, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export const Greeting = () => {
  const variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  return (
    <div className="h-full pt-4">
      <div className="w-full mx-auto max-w-3xl px-4 text-center leading-8">
        <motion.p
          className="flex items-center justify-center gap-x-3 mb-5"
          {...variants}
        >
          <Bot className="size-10" /> + <MessageCircle className="size-10" />
        </motion.p>

        <motion.p {...variants} transition={{ delay: 0.5 }}>
          使用 Nextjs + Shadcn/ui + AI SDK 支持会话流恢复的聊天机器人模板。
        </motion.p>
        <motion.p {...variants} transition={{ delay: 1 }}>
          支持天气查询、新闻查询、热榜查询。
        </motion.p>
        <motion.p {...variants} transition={{ delay: 1.5 }}>
          在客户端使用 &quot;useChat&quot; 钩子，以创建无缝的聊天体验。
        </motion.p>
      </div>
    </div>
  );
};
