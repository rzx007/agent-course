import { tool } from "ai";
import { z } from "zod";

// 支持的图片主类别
const MAIN_CATEGORIES = [
  "furry",
  "bq",
  "acg",
  "ai_drawing",
  "general_anime",
  "landscape",
  "mobile_wallpaper",
  "pc_wallpaper",
  "anime",
] as const;

// 支持的子类别（按主类别分组）
const SUB_CATEGORIES = {
  furry: ["z4k", "szs8k", "s4k", "4k"],
  bq: ["youshou", "xiongmao", "waiguoren", "maomao", "ikun", "eciyuan"],
  acg: ["pc", "mb"],
} as const;

/**
 * 获取随机图片
 * 从庞大的图库和精选外部图床中随机挑选图片
 */
export const getRandomImage = tool({
  description:
    "获取随机图片，可用作占位符或背景。支持多种分类：福瑞、表情包、二次元动漫、AI绘画、风景图、手机/电脑壁纸等。可以指定图片类别，也可以完全随机。",
  inputSchema: z.object({
    category: z
      .enum(MAIN_CATEGORIES)
      .optional()
      .describe(
        "图片主类别。可选值：furry(福瑞)、bq(表情包)、acg(二次元)、ai_drawing(AI绘画)、general_anime(动漫)、landscape(风景)、mobile_wallpaper(手机壁纸)、pc_wallpaper(电脑壁纸)、anime(混合动漫)。不指定则完全随机。"
      ),
    type: z
      .string()
      .optional()
      .describe(
        "图片子类别（仅UapiPro服务器图片支持）。furry可选: z4k/szs8k/s4k/4k; bq可选: youshou/xiongmao/waiguoren/maomao/ikun/eciyuan; acg可选: pc/mb"
      ),
  }),
  needsApproval: false,
  execute: async (input) => {
    try {
      // 构建 URL
      const params = new URLSearchParams();
      if (input.category) {
        params.append("category", input.category);
      }
      if (input.type) {
        params.append("type", input.type);
      }

      const url = `https://uapis.cn/api/v1/random/image${params.toString() ? `?${params.toString()}` : ""}`;

      // 设置超时时间（10秒）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        redirect: "follow", // 跟随302重定向
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // 处理不同的HTTP错误状态
        if (response.status === 404) {
          return {
            error: `未找到指定类别的图片。请检查 category: ${input.category || "全局随机"}${input.type ? `, type: ${input.type}` : ""}`,
          };
        } else if (response.status === 500) {
          return {
            error: "服务器选择随机图片时发生错误，请稍后重试。",
          };
        } else {
          return {
            error: `获取随机图片失败，HTTP状态码：${response.status}`,
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

      // 获取最终的URL（经过重定向后）
      const finalUrl = response.url;

      // 返回图片数据
      return {
        imageUrl: `data:${contentType};base64,${base64Image}`,
        originalUrl: finalUrl,
        contentType,
        size: buffer.length,
        category: input.category || "random",
        type: input.type,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // 处理超时错误
      if (error instanceof Error && error.name === "AbortError") {
        return {
          error: "请求超时，图片获取时间过长，请稍后重试。",
        };
      }

      return {
        error: `获取随机图片时发生异常：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});

/**
 * 使用示例：
 * "给我一张随机图片"
 * "来一张二次元图片"
 * "显示一张风景壁纸"
 * "随机来张福瑞图"
 * "给我看看AI绘画"
 * "来一张手机壁纸"
 */
