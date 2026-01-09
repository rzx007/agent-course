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
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from "ai";
import { useSearchParams } from "next/navigation";
import { ChatMessage } from "@/lib/types";
import { useRefreshChatHistory } from "@/hooks/use-chat-history";
import { chatModels } from "@/lib/ai/models";
import { Tool, ToolHeader, ToolContent, ToolInput } from "./ai-elements/tool";

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
  const [model, setModel] = useState<string>(chatModels[0].id);
  const [webSearch, setWebSearch] = useState(false);

  // 获取刷新聊天历史的函数
  const refreshChatHistory = useRefreshChatHistory();

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
    // 【方案2】在客户端 onFinish 中保存消息
    onFinish: async ({ messages: finishedMessages }) => {
      if (!id) return;
      
      // 只保存 assistant 消息(用户消息在服务端已经保存)
      const assistantMessages = finishedMessages.filter(
        (msg) => msg.role === "assistant"
      );
      
      if (assistantMessages.length > 0) {
        try {
          await fetch("/api/chat/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chatId: id,
              messages: assistantMessages,
            }),
          });
          console.log("✅ 消息已保存到数据库");
        } catch (error) {
          console.error("❌ 保存消息失败:", error);
        }
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
                  case "tool-getWeather":
                    const { toolCallId, state } = part;
                    const approvalId = (part as { approval?: { id: string } })
                      .approval?.id;

                    const widthClass = "w-[min(100%,450px)]";

                    // 工具输出可用时的视图(可以指定输出格式)
                    if (state === "output-available") {
                      const weatherData = part.output as {
                        cityName?: string;
                        current?: { temperature_2m?: number };
                        elevation?: number;
                        timezone?: string;
                      };
                      const city = (part.input as { city: string }).city;
                      
                      return (
                        <div key={part.toolCallId} className="mb-4">
                          <div className="rounded-lg border bg-card p-4">
                            <h3 className="font-semibold mb-2">
                              🌡️ {weatherData.cityName || city} 的天气
                            </h3>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="text-muted-foreground">当前温度:</span>{" "}
                                <span className="font-medium">
                                  {weatherData.current?.temperature_2m}°C
                                </span>
                              </p>
                              <p>
                                <span className="text-muted-foreground">海拔:</span>{" "}
                                {weatherData.elevation}m
                              </p>
                              <p>
                                <span className="text-muted-foreground">时区:</span>{" "}
                                {weatherData.timezone}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // 拒绝调用工具时的视图
                    const isDenied =
                      state === "output-denied" ||
                      (state === "approval-responded" &&
                        (part as { approval?: { approved?: boolean } }).approval
                          ?.approved === false);
                    if (isDenied) {
                      return (
                        <div className={widthClass} key={toolCallId}>
                          <Tool className="w-full" defaultOpen={true}>
                            <ToolHeader
                              state="output-denied"
                              type="tool-getWeather"
                            />
                            <ToolContent>
                              <div className="px-4 py-3 text-muted-foreground text-sm">
                                拒绝天气查询
                              </div>
                            </ToolContent>
                          </Tool>
                        </div>
                      );
                    }
                    // 已经审批，等待工具输出前的视图
                    if (state === "approval-responded") {
                      return (
                        <div className={widthClass} key={toolCallId}>
                          <Tool className="w-full" defaultOpen={true}>
                            <ToolHeader state={state} type="tool-getWeather" />
                            <ToolContent>
                              <ToolInput input={part.input} />
                            </ToolContent>
                          </Tool>
                        </div>
                      );
                    }
                    // 等待审批的视图
                    return (
                      <div className={widthClass} key={toolCallId}>
                        <Tool className="w-full" defaultOpen={true}>
                          <ToolHeader state={state} type="tool-getWeather" />
                          <ToolContent>
                            {(state === "input-available" ||
                              state === "approval-requested") && (
                              <ToolInput input={part.input} />
                            )}
                            {state === "approval-requested" && approvalId && (
                              <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                                <button
                                  className="rounded-md px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                                  onClick={() => {
                                    addToolApprovalResponse({
                                      id: approvalId,
                                      approved: false,
                                      reason: "User denied weather lookup",
                                    });
                                  }}
                                  type="button"
                                >
                                  拒绝
                                </button>
                                <button
                                  className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-sm transition-colors hover:bg-primary/90"
                                  onClick={() => {
                                    addToolApprovalResponse({
                                      id: approvalId,
                                      approved: true,
                                    });
                                  }}
                                  type="button"
                                >
                                  允许
                                </button>
                              </div>
                            )}
                          </ToolContent>
                        </Tool>
                      </div>
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
                {chatModels.map((model) => (
                  <PromptInputSelectItem key={model.id} value={model.id}>
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
