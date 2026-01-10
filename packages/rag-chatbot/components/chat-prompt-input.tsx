"use client";

import { GlobeIcon } from "lucide-react";
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
import { chatModels } from "@/lib/ai/models";
import type { ChatStatus } from "ai";

interface ChatPromptInputProps {
  /**
   * 输入值
   */
  input: string;
  /**
   * 输入值变化回调
   */
  onInputChange: (value: string) => void;
  /**
   * 选中的模型
   */
  model: string;
  /**
   * 模型变化回调
   */
  onModelChange: (model: string) => void;
  /**
   * 是否启用网络搜索
   */
  webSearch: boolean;
  /**
   * 网络搜索切换回调
   */
  onWebSearchChange: (enabled: boolean) => void;
  /**
   * 提交回调
   */
  onSubmit: (message: PromptInputMessage) => void;
  /**
   * 停止生成回调
   */
  onStop: () => void;
  /**
   * 聊天状态
   */
  status: ChatStatus;
  /**
   * 自定义类名
   */
  className?: string;
}

export const ChatPromptInput = ({
  input,
  onInputChange,
  model,
  onModelChange,
  webSearch,
  onWebSearchChange,
  onSubmit,
  onStop,
  status,
  className = "max-w-4xl mx-auto my-4",
}: ChatPromptInputProps) => {
  return (
    <PromptInput
      onSubmit={onSubmit}
      className={className}
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
          onChange={(e) => onInputChange(e.target.value)}
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
            onClick={() => onWebSearchChange(!webSearch)}
          >
            <GlobeIcon size={16} />
            <span>Search</span>
          </PromptInputButton>
          <PromptInputSelect
            onValueChange={(value) => {
              onModelChange(value);
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
            onStop();
          }}
        />
      </PromptInputFooter>
    </PromptInput>
  );
};
