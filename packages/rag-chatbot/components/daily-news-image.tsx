"use client";

import Image from "next/image";
import { CalendarIcon, ImageIcon, AlertCircleIcon } from "lucide-react";
import { useState } from "react";

/**
 * 每日新闻图数据接口
 */
export interface DailyNewsImageData {
  imageUrl?: string;
  contentType?: string;
  size?: number;
  timestamp?: string;
  error?: string;
}

/**
 * 每日新闻图组件属性
 */
export interface DailyNewsImageProps {
  data: DailyNewsImageData;
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * 格式化时间戳
 */
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * 每日新闻图展示组件
 */
export const DailyNewsImage = ({ data }: DailyNewsImageProps) => {
  const { imageUrl, contentType, size, timestamp, error } = data;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircleIcon className="size-5" />
          <span className="font-medium">获取每日新闻图失败</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  // 如果没有图片URL
  if (!imageUrl) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center text-muted-foreground">
        暂无新闻图数据
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-5 text-blue-500" />
          <h3 className="font-semibold text-lg">今日新闻摘要</h3>
        </div>
        {timestamp && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <CalendarIcon className="size-3" />
            <span>{formatTimestamp(timestamp)}</span>
          </div>
        )}
      </div>

      {/* 图片展示区域 */}
      <div className="relative bg-muted/30 p-4">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">加载中...</span>
            </div>
          </div>
        )}

        {hasError && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2 text-destructive">
              <AlertCircleIcon className="size-8" />
              <span className="text-sm">图片加载失败</span>
            </div>
          </div>
        )}

        <Image
          src={imageUrl}
          alt="今日新闻摘要"
          className={`mx-auto max-w-full rounded-lg shadow-md transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          width={500}
          height={300}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          style={{ display: hasError ? "none" : "block" }}
        />
      </div>

      {/* 底部信息 */}
      {!hasError && (
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {contentType && (
              <span>
                格式：{contentType.split("/")[1]?.toUpperCase() || "JPEG"}
              </span>
            )}
            {size && <span>大小：{formatFileSize(size)}</span>}
          </div>
          <a
            href={imageUrl}
            download={`每日新闻-${new Date().toLocaleDateString("zh-CN")}.jpg`}
            className="text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            下载图片
          </a>
        </div>
      )}
    </div>
  );
};
