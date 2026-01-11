"use client";

import { useEffect, useRef, useState } from "react";
import { useChat, isStaticToolUIPart, getStaticToolName } from "@ai-sdk/react";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
  MessageAttachment,
  MessageAttachments,
} from "@/components/ai-elements/message";
import { type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { useSearchParams } from "next/navigation";
import { ChatMessage } from "@/lib/types";
import { useRefreshChatHistory, useDeleteMessage } from "@/hooks/use-chat-history";
import { chatModels } from "@/lib/ai/models";
import { Weather, WeatherAtLocation } from "./weather";
import { HotNews, HotNewsData } from "./hot-news";
import { DailyNewsImage, DailyNewsImageData } from "./daily-news-image";
import { RandomImage, RandomImageData } from "./random-image";
import { ToolRenderer } from "./tool-renderer";
import { SuggestedActions } from "./suggested-actions";
import { ChatPromptInput } from "./chat-prompt-input";

interface ChatInterfaceProps {
  /**
   * 聊天会话 ID（可选）
   */
  id: string;
  /**
   * 初始消息
   */
  initialMessages?: ChatMessage[];
  /**
   * 是否显示问候语（默认为 false）
   */
  showGreeting?: boolean;
  /**
   * 自定义问候语组件
   */
  greetingComponent?: React.ReactNode;
}

export const ChatInterface = ({
  id,
  initialMessages,
  showGreeting = false,
  greetingComponent,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>(chatModels[0].id);
  const [webSearch, setWebSearch] = useState(false);

  // 获取刷新聊天历史的函数
  const refreshChatHistory = useRefreshChatHistory();
  // 删除消息的 mutation
  const deleteMessageMutation = useDeleteMessage();

  const {
    messages,
    sendMessage,
    status,
    regenerate,
    stop,
    addToolApprovalResponse,
  } = useChat({
    id,
    messages: initialMessages,
    resume: true,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // 配置重链接地址
      prepareReconnectToStreamRequest: (request) => {
        const { id } = request;
        return { api: `/api/chat/${id}/stream` };
      },
    }),
    onData: (part) => {
      // 处理后端兜底发来的 data-appendMessage
      if (part.type === "data-appendMessage") {
        // AI SDK 内部会自动处理这种同步逻辑
        console.log("Restored complete message from DB");
      } else if (part.type === "data-chat-title") {
        // 更新历史列表 - 使用 React Query 刷新
        console.log("Updated chat title:", part.data);
        refreshChatHistory();
      }
    },
  });

  // 【核心魔法】处理首页传来的查询参数
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const hasAppendedQueryRef = useRef(false);

  useEffect(() => {
    if (query && !hasAppendedQueryRef.current) {
      // 1. 发起聊天请求（此时 URL 还是 /chat?query=...）
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: query }],
      });

      hasAppendedQueryRef.current = true;

      // 2. 【关键】静默替换 URL 为 /chat/[id]
      // 这样组件不会卸载，Fetch 连接保持，但地址栏变了，刷新也会进详情页
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [id, sendMessage, query]);

  const handleSubmit = (message: PromptInputMessage) => {
    window.history.pushState({}, "", `/chat/${id}`);
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      }
    );
    setInput("");
  };

  // 处理重新生成：删除数据库中的 assistant 消息和对应的 user 消息
  const handleRegenerate = async () => {
    // 找到最后一条 assistant 消息
    const lastAssistantIndex = [...messages]
      .reverse()
      .findIndex((msg) => msg.role === "assistant");
    
    if (lastAssistantIndex === -1) {
      regenerate();
      return;
    }

    const actualIndex = messages.length - 1 - lastAssistantIndex;
    const lastAssistantMessage = messages[actualIndex];
    
    // 找到最后一个 role 为 user 的消息
    const lastUserIndex = [...messages]
      .reverse()
      .findIndex((msg) => msg.role === "user");
    const correspondingUserMessage = lastUserIndex !== -1 
      ? messages[messages.length - 1 - lastUserIndex]
      : null;

    try {
      // 删除 assistant 消息
      await deleteMessageMutation.mutateAsync({
        messageId: lastAssistantMessage.id,
        chatId: id,
      });
      console.log("Deleted assistant message:", lastAssistantMessage.id);

      // 如果存在对应的 user 消息，也删除它
      if (correspondingUserMessage && correspondingUserMessage.role === "user") {
        await deleteMessageMutation.mutateAsync({
          messageId: correspondingUserMessage.id,
          chatId: id,
        });
        console.log("Deleted user message:", correspondingUserMessage.id);
      }
    } catch (error) {
      console.error("Failed to delete messages:", error);
    }

    // 调用原始的 regenerate 函数
    regenerate();
  };

  return (
    <div className="flex flex-col h-full">
      {showGreeting && messages.length === 0 && greetingComponent}
      <Conversation className="h-full">
        <ConversationContent className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div key={message.id}>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role} className="my-2">
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                        {message.role === "assistant" &&
                          index === messages.length - 1 && (
                            <MessageActions>
                              <MessageAction
                                onClick={() => handleRegenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </MessageAction>
                              <MessageAction
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </MessageAction>
                            </MessageActions>
                          )}
                        {/* {message.metadata && (
                          <div className="text-xs text-gray-400">
                            {JSON.stringify(message.metadata)}
                          </div>
                        )} */}
                      </Message>
                    );
                  case "reasoning":
                    return (
                      <Reasoning
                        key={`${message.id}-${i}`}
                        className="w-full"
                        isStreaming={
                          status === "streaming" &&
                          i === message.parts.length - 1 &&
                          message.id === messages.at(-1)?.id
                        }
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>{part.text}</ReasoningContent>
                      </Reasoning>
                    );
                  case "file":
                    return (
                      <MessageAttachments
                        key={`${message.id}-${i}`}
                        className="mb-2"
                      >
                        <MessageAttachment data={part} key={part.url} />
                      </MessageAttachments>
                    );
                  case "tool-getWeather":
                    return (
                      <ToolRenderer
                        key={`${message.id}-${i}`}
                        part={part}
                        addToolApprovalResponse={addToolApprovalResponse}
                        renderOutput={(output) => (
                          <Weather
                            weatherAtLocation={output as WeatherAtLocation}
                          />
                        )}
                        deniedMessage="拒绝天气查询"
                      />
                    );
                  case "tool-getHotNews":
                    return (
                      <ToolRenderer
                        key={`${message.id}-${i}`}
                        part={part}
                        addToolApprovalResponse={addToolApprovalResponse}
                        renderOutput={(output) => (
                          <HotNews hotNewsData={output as HotNewsData} />
                        )}
                        deniedMessage="拒绝热榜查询"
                        className="w-[min(100%,600px)]"
                      />
                    );
                  case "tool-getDailyNewsImage":
                    return (
                      <ToolRenderer
                        key={`${message.id}-${i}`}
                        part={part}
                        addToolApprovalResponse={addToolApprovalResponse}
                        renderOutput={(output) => (
                          <DailyNewsImage data={output as DailyNewsImageData} />
                        )}
                        deniedMessage="拒绝获取每日新闻图"
                        className="w-[min(100%,700px)]"
                      />
                    );
                  case "tool-getRandomImage":
                    return (
                      <ToolRenderer
                        key={`${message.id}-${i}`}
                        part={part}
                        addToolApprovalResponse={addToolApprovalResponse}
                        renderOutput={(output) => (
                          <RandomImage data={output as RandomImageData} />
                        )}
                        deniedMessage="拒绝获取随机图片"
                        className="w-[min(100%,700px)]"
                      />
                    );
                  default:
                    return null;
                }
              })}
              {message.role === "assistant" &&
                message.parts.filter((part) => part.type === "source-url")
                  .length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === "source-url"
                        ).length
                      }
                    />
                    {message.parts
                      .filter((part) => part.type === "source-url")
                      .map((part, i) => (
                        <SourcesContent key={`${message.id}-${i}`}>
                          <Source
                            key={`${message.id}-${i}`}
                            href={part.url}
                            title={part.url}
                          />
                        </SourcesContent>
                      ))}
                  </Sources>
                )}
            </div>
          ))}
          {status === "submitted" && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* 建议输入 */}
      {messages.length === 0 && (
        <div className="w-full max-w-4xl mx-auto my-4">
          <SuggestedActions chatId={id} sendMessage={sendMessage} />
        </div>
      )}
      <ChatPromptInput
        input={input}
        onInputChange={setInput}
        model={model}
        onModelChange={setModel}
        webSearch={webSearch}
        onWebSearchChange={setWebSearch}
        onSubmit={handleSubmit}
        onStop={stop}
        status={status}
      />
    </div>
  );
};
