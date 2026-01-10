import { tool } from "ai";
import { z } from "zod";

/**
 * 获取每日新闻图
 * 返回今日新闻摘要的图片URL
 */
export const getDailyNewsImage = tool({
  description:
    "获取今日新闻摘要图片，一张图快速了解天下大事。适合用在早报、数字看板或应用首页等场景。返回的是一张清晰、美观的新闻摘要图片。",
  inputSchema: z.object({
    // 该接口不需要参数，但为了符合 tool 规范，添加一个可选的确认字段
    confirm: z
      .boolean()
      .optional()
      .default(true)
      .describe("确认获取今日新闻图"),
  }),
  needsApproval: false,
  execute: async () => {
    try {
      // 设置较长的超时时间（15秒），因为图片生成需要时间
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        "https://uapis.cn/api/v1/daily/news-image",
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        // 处理不同的HTTP错误状态
        if (response.status === 502) {
          return {
            error: "上游新闻源服务暂时不可用，请稍后重试。",
          };
        } else if (response.status === 500) {
          return {
            error: "图片生成服务遇到临时故障，请稍后重试。",
          };
        } else {
          return {
            error: `获取新闻图失败，HTTP状态码：${response.status}`,
          };
        }
      }

      // 检查响应类型是否为图片
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("image")) {
        return {
          error: "服务返回的不是图片格式，请联系管理员。",
        };
      }

      // 获取图片数据并转换为 base64
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString("base64");

      // 返回图片数据
      return {
        imageUrl: `data:${contentType};base64,${base64Image}`,
        contentType,
        size: buffer.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // 处理超时错误
      if (error instanceof Error && error.name === "AbortError") {
        return {
          error: "请求超时，新闻图生成时间较长，请稍后重试。",
        };
      }

      return {
        error: `获取每日新闻图时发生异常：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

/**
 * "给我看看今天的新闻"
 * "显示每日新闻摘要"
 * "今日新闻图"
 * "生成新闻早报"
 */
