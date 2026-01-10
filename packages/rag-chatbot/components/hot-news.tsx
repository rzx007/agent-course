"use client";

import { ExternalLinkIcon, FlameIcon } from "lucide-react";
import { HotboardType } from "@/lib/ai/tools/get-hotnews";

/**
 * 热榜条目接口
 */
export interface HotNewsItem {
  title: string;
  url?: string;
  hot?: string | number;
  desc?: string;
  [key: string]: unknown;
}

/**
 * 热榜数据接口
 */
export interface HotNewsData {
  platform: HotboardType;
  list?: HotNewsItem[];
  type?: string;
  updateTime?: string;
  error?: string;
}

/**
 * 平台名称映射
 */
const platformNames: Record<string, string> = {
  bilibili: "哔哩哔哩",
  weibo: "微博热搜",
  zhihu: "知乎热榜",
  "zhihu-daily": "知乎日报",
  douyin: "抖音热榜",
  kuaishou: "快手热榜",
  baidu: "百度热搜",
  toutiao: "今日头条",
  "qq-news": "腾讯新闻",
  juejin: "掘金",
  ithome: "IT之家",
  csdn: "CSDN",
  // 可以继续添加更多平台名称
};

/**
 * 获取平台显示名称
 */
const getPlatformName = (platform: string): string => {
  return platformNames[platform] || platform;
};

/**
 * 热榜显示组件属性
 */
export interface HotNewsProps {
  hotNewsData: HotNewsData;
}

/**
 * 热榜显示组件
 */
export const HotNews = ({ hotNewsData }: HotNewsProps) => {
  const { platform, list, updateTime, error } = hotNewsData;

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <FlameIcon className="size-5" />
          <span className="font-medium">获取热榜失败</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  // 如果没有列表数据
  if (!list || list.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4 text-center text-muted-foreground">
        暂无热榜数据
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <FlameIcon className="size-5 text-orange-500" />
          <h3 className="font-semibold text-lg">
            {getPlatformName(platform)} 热榜
          </h3>
        </div>
        {updateTime && (
          <span className="text-muted-foreground text-xs">
            更新时间：{updateTime}
          </span>
        )}
      </div>

      {/* 热榜列表 */}
      <div className="divide-y">
        {list.slice(0, 20).map((item, index) => (
          <div
            key={index}
            className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
          >
            {/* 排名 */}
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${
                index < 3
                  ? "bg-linear-to-br from-orange-500 to-red-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>

            {/* 内容 */}
            <div className="min-w-0 flex-1">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
                >
                  <span className="line-clamp-2">{item.title}</span>
                  <ExternalLinkIcon className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ) : (
                <p className="text-sm font-medium line-clamp-2">{item.title}</p>
              )}

              {/* 描述或热度 */}
              {(item.desc || item.hot) && (
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {item.hot && (
                    <span className="flex items-center gap-1">
                      <FlameIcon className="size-3" />
                      {item.hot}
                    </span>
                  )}
                  {item.desc && <span className="line-clamp-1">{item.desc}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      {list.length > 20 && (
        <div className="border-t px-4 py-2 text-center text-muted-foreground text-xs">
          仅显示前 20 条，共 {list.length} 条热榜
        </div>
      )}
    </div>
  );
};
