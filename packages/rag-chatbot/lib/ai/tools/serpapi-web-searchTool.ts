import { tool } from "ai";
import { z } from "zod";
import { getJson } from "serpapi";

const MAX_RESULTS = 8;

interface SerpOrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
  position?: number;
}

interface SerpApiResponse {
  organic_results?: SerpOrganicResult[];
  error?: string;
}

export const serpApiWebSearchTool = tool({
  description:
    "搜索互联网以获取最新信息、新闻或特定问题的答案。当用户询问实时、近期事件或需要查证的事实时使用。",
  inputSchema: z.object({
    query: z.string().describe("要在 Google 中搜索的查询语句"),
  }),
  execute: async (input) => {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      console.error("未配置 SERPAPI_API_KEY，无法执行网页搜索。请在服务端环境变量中配置。");
      return {
        error: "未配置 SERPAPI_API_KEY，无法执行网页搜索。请在服务端环境变量中配置。",
      };
    }

    try {
      const response = (await getJson({
        engine: "google",
        api_key: apiKey,
        q: input.query,
        hl: "zh-cn",
        gl: "cn",
      })) as SerpApiResponse;

      if (response.error) {
        return { error: `SerpAPI 返回错误: ${response.error}` };
      }

      const results =
        response.organic_results?.slice(0, MAX_RESULTS).map((r) => ({
          title: r.title ?? "",
          link: r.link ?? "",
          snippet: r.snippet ?? "",
          position: r.position,
        })) ?? [];

      return { results, total: results.length };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { error: `网页搜索失败: ${message}` };
    }
  },
});