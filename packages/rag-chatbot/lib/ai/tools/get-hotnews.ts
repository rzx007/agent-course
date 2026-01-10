import { tool } from "ai";
import { z } from "zod";

// 支持的热榜平台类型
const HOTBOARD_TYPES = [
  // 视频/社区
  "bilibili", "acfun", "weibo", "zhihu", "zhihu-daily", "douyin", "kuaishou",
  "douban-movie", "douban-group", "tieba", "hupu", "miyoushe", "ngabbs",
  "v2ex", "52pojie", "hostloc", "coolapk",
  // 新闻/资讯
  "baidu", "thepaper", "toutiao", "qq-news", "sina", "sina-news",
  "netease-news", "huxiu", "ifanr",
  // 技术/IT
  "sspai", "ithome", "ithome-xijiayi", "juejin", "jianshu", "guokr",
  "36kr", "51cto", "csdn", "nodeseek", "hellogithub",
  // 游戏
  "lol", "genshin", "honkai", "starrail",
  // 其他
  "weread", "weatheralarm", "earthquake", "history"
] as const;

export type HotboardType = typeof HOTBOARD_TYPES[number];

/**
 * 获取指定平台的热榜数据
 */
export const getHotNews = tool({
  description:
    "获取各大主流平台的实时热榜/热搜数据，包括哔哩哔哩、微博、知乎、抖音、百度等平台。每个热榜条目包含标题、热度值和原始链接。",
  inputSchema: z.object({
    type: z
      .enum(HOTBOARD_TYPES)
      .describe(
        "要查询的热榜平台类型，例如：'weibo'(微博热搜)、'bilibili'(B站热榜)、'zhihu'(知乎热榜)、'baidu'(百度热搜)等"
      ),
  }),
  needsApproval: false,
  execute: async (input) => {
    try {
      const response = await fetch(
        `https://uapis.cn/api/v1/misc/hotboard?type=${input.type}`
      );

      if (!response.ok) {
        // 处理不同的HTTP错误状态
        if (response.status === 400) {
          return {
            error: `无效的热榜平台类型：${input.type}，请检查参数是否正确。`,
          };
        } else if (response.status === 502) {
          return {
            error: `无法从 ${input.type} 平台获取数据，上游服务可能暂时不可用。`,
          };
        } else if (response.status === 500) {
          return {
            error: "服务器处理热榜数据时发生内部错误，请稍后重试。",
          };
        } else {
          return {
            error: `获取热榜失败，HTTP状态码：${response.status}`,
          };
        }
      }

      const data = await response.json();

      // 返回热榜数据
      return {
        platform: input.type,
        list: data.list,
        type: data.type,
        updateTime: data.update_time,
      };
    } catch (error) {
      return {
        error: `获取热榜数据时发生异常：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});