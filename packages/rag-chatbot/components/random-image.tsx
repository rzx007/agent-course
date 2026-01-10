"use client";

import Image from "next/image";
import { ImageIcon, AlertCircleIcon, TagIcon, ExternalLinkIcon } from "lucide-react";
import { useState } from "react";

/**
 * 随机图片数据接口
 */
export interface RandomImageData {
  imageUrl?: string;
  originalUrl?: string;
  contentType?: string;
  size?: number;
  category?: string;
  type?: string;
  timestamp?: string;
  error?: string;
}

/**
 * 随机图片组件属性
 */
export interface RandomImageProps {
  data: RandomImageData;
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
 * 分类名称映射
 */
const categoryNames: Record<string, string> = {
  furry: "福瑞",
  bq: "表情包",
  acg: "二次元",
  ai_drawing: "AI绘画",
  general_anime: "动漫图",
  landscape: "风景图",
  mobile_wallpaper: "手机壁纸",
  pc_wallpaper: "电脑壁纸",
  anime: "混合动漫",
  random: "随机图片",
};

/**
 * 随机图片展示组件
 */
export const RandomImage = ({ data }: RandomImageProps) => {
  const { imageUrl, originalUrl, contentType, size, category, type, error } = data;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircleIcon className="size-5" />
          <span className="font-medium">获取随机图片失败</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  // 如果没有图片URL
  if (!imageUrl) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center text-muted-foreground">
        暂无图片数据
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-5 text-purple-500" />
          <h3 className="font-semibold text-lg">
            {categoryNames[category || "random"] || "随机图片"}
          </h3>
          {type && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <TagIcon className="size-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {category || "random"}
          </span>
        </div>
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
          alt={`${categoryNames[category || "random"]} - 随机图片`}
          className={`mx-auto max-w-full rounded-lg shadow-md transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          width={800}
          height={600}
          unoptimized
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
          <div className="flex items-center gap-3">
            {originalUrl && (
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                <ExternalLinkIcon className="size-3" />
                <span>查看原图</span>
              </a>
            )}
            <a
              href={imageUrl}
              download={`随机图片-${category || "random"}-${new Date().getTime()}.jpg`}
              className="text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              下载图片
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
