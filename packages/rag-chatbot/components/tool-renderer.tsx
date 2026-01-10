import { ReactNode } from "react";
import { ToolUIPart } from "ai";
import { Tool, ToolHeader, ToolContent, ToolInput } from "./ai-elements/tool";

/**
 * 工具渲染配置接口
 */
export interface ToolRenderConfig<TOutput = unknown> {
  /** 工具 UI 部分（包含所有基础信息） */
  part: ToolUIPart;
  /** 添加工具审批响应的函数 */
  addToolApprovalResponse: (response: {
    id: string;
    approved: boolean;
    reason?: string;
  }) => void;
  /** 自定义输出渲染组件 */
  renderOutput?: (output: TOutput) => ReactNode;
  /** 拒绝时的提示文本 */
  deniedMessage?: string;
  /** 自定义容器类名 */
  className?: string;
}

/**
 * 通用的工具渲染函数
 * 适用于所有需要人工审批的工具
 */
export function renderToolWithApproval<TOutput = unknown>(
  config: ToolRenderConfig<TOutput>
): ReactNode {
  const {
    part,
    addToolApprovalResponse,
    renderOutput,
    deniedMessage = "操作已被拒绝",
    className = "w-[min(100%,450px)]",
  } = config;

  const { type: toolType, state, toolCallId, input, output } = part;
  const approval = (part as { approval?: { id: string; approved?: boolean; reason?: string } }).approval;
  const approvalId = approval?.id;

  // 1. 工具输出可用时的视图（自定义渲染）
  if (state === "output-available" && output && renderOutput) {
    return (
      <div className={className} key={toolCallId}>
        {renderOutput(output as TOutput)}
      </div>
    );
  }

  // 2. 拒绝调用工具时的视图
  const isDenied =
    state === "output-denied" ||
    (state === "approval-responded" && approval?.approved === false);

  if (isDenied) {
    return (
      <div className={className} key={toolCallId}>
        <Tool className="w-full" defaultOpen={true}>
          <ToolHeader state="output-denied" type={toolType} />
          <ToolContent>
            <div className="px-4 py-3 text-muted-foreground text-sm">
              {deniedMessage}
            </div>
          </ToolContent>
        </Tool>
      </div>
    );
  }

  // 3. 已经审批，等待工具输出前的视图
  if (state === "approval-responded") {
    return (
      <div className={className} key={toolCallId}>
        <Tool className="w-full" defaultOpen={true}>
          <ToolHeader state={state} type={toolType} />
          <ToolContent>
            <ToolInput input={input} />
          </ToolContent>
        </Tool>
      </div>
    );
  }

  // 4. 等待审批的视图
  return (
    <div className={className} key={toolCallId}>
      <Tool className="w-full" defaultOpen={true}>
        <ToolHeader state={state} type={toolType} />
        <ToolContent>
          {(state === "input-available" || state === "approval-requested") && (
            <ToolInput input={input} />
          )}
          {state === "approval-requested" && approvalId && (
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
              <button
                className="rounded-md px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => {
                  addToolApprovalResponse({
                    id: approvalId,
                    approved: false,
                    reason: `用户拒绝${toolType}调用`,
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
}
