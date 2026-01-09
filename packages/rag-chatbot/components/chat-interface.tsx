"use client";

import { useEffect, useRef, useState } from "react";
import { UIMessage, useChat } from "@ai-sdk/react";
import { CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react";
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
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
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
import { DefaultChatTransport } from "ai";
import { useSearchParams } from "next/navigation";
import { ChatMessage } from "@/lib/types";
import { useRefreshChatHistory } from "@/hooks/use-chat-history";

const models = [
  {
    name: "Xiaomi MIMO",
    value: "xiaomi/mimo",
  },
  {
    name: "Deepseek R1",
    value: "deepseek/deepseek-r1",
  },
];

interface ChatInterfaceProps {
  /**
   * 聊天会话 ID（可选）
   */
  id?: string;
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
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);

  // 获取刷新聊天历史的函数
  const refreshChatHistory = useRefreshChatHistory();

  const { messages, sendMessage, status, regenerate, stop } = useChat({
    id,
    messages: initialMessages,
    resume: true,
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

  return (
    <div className="flex flex-col h-full">
      {showGreeting && messages.length === 0 && greetingComponent}
      <Conversation className="h-full">
        <ConversationContent className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div key={message.id}>
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
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case "text":
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                        {message.role === "assistant" &&
                          index === messages.length - 1 && (
                            <MessageActions>
                              <MessageAction
                                onClick={() => regenerate()}
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
                  default:
                    return null;
                }
              })}
            </div>
          ))}
          {status === "submitted" && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto my-4"
        globalDrop
        multiple
      >
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputButton
              variant={webSearch ? "default" : "ghost"}
              onClick={() => setWebSearch(!webSearch)}
            >
              <GlobeIcon size={16} />
              <span>Search</span>
            </PromptInputButton>
            <PromptInputSelect
              onValueChange={(value) => {
                setModel(value);
              }}
              value={model}
            >
              <PromptInputSelectTrigger>
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                {models.map((model) => (
                  <PromptInputSelectItem key={model.value} value={model.value}>
                    {model.name}
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
          </PromptInputTools>
          <PromptInputSubmit
            disabled={!input && !status}
            status={status}
            onClick={() => {
              stop();
            }}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
};
