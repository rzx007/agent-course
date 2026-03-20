import type { LanguageModel } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createZhipu } from "zhipu-ai-provider";
import { chatModels } from "./models";

/**
 * 根据 `modelId` 返回 AI SDK 的 `LanguageModel`，供 `streamText` / `generateText` 使用。
 */

const providerCache: Record<
  string,
  | ReturnType<typeof createDeepSeek>
  | ReturnType<typeof createOpenAI>
  | ReturnType<typeof createGoogleGenerativeAI>
  | ReturnType<typeof createZhipu>
> = {};

function getProviderName(modelId: string): string {
  const found = chatModels.find((m) => m.id === modelId);
  if (found) return found.provider;
  if (modelId.startsWith("deepseek-")) return "deepseek";
  if (modelId.startsWith("gpt-") || modelId.startsWith("o1-")) return "openai";
  if (modelId.startsWith("gemini-")) return "google";
  if (modelId.startsWith("glm-")) return "zhipu";
  if (modelId.startsWith("mimo-")) return "xiaomi";
  return "deepseek";
}

function getDeepSeekProvider() {
  if (!providerCache.deepseek) {
    providerCache.deepseek = createDeepSeek({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "",
      fetch: async (url, options) => {
        const body = JSON.parse((options?.body as string) ?? "{}");
        const modifiedBody = { ...body };
        const response = await fetch(url, {
          ...options,
          body: JSON.stringify(modifiedBody),
        });
        if (!response.ok) throw new Error(response.statusText);
        return response;
      },
    });
  }
  return providerCache.deepseek as ReturnType<typeof createDeepSeek>;
}

function getOpenAIProvider() {
  if (!providerCache.openai) {
    providerCache.openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return providerCache.openai;
}

function getXiaomiProvider() {
  if (!providerCache.xiaomi) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is required for xiaomi provider");
    providerCache.xiaomi = createDeepSeek({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "",
      // 自定义 fetch 实现,mimo-v2-flash有些独有的参数
      fetch: async (url, options) => {
        // 1. 解析原始请求体
        const body = JSON.parse(options?.body as string);

        // 2. 注入自定义参数
        const modifiedBody = {
          ...body,
          // thinking: { type: "enabled" }, // 启用思考过程
        };
        const response = await fetch(url, {
          ...options,
          body: JSON.stringify(modifiedBody),
        });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response;
      },
    });
  }
  return providerCache.xiaomi as ReturnType<typeof createOpenAI>;
}

function getGoogleProvider() {
  if (!providerCache.google) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey)
      throw new Error(
        "GOOGLE_GENERATIVE_AI_API_KEY is required for google provider"
      );
    providerCache.google = createGoogleGenerativeAI({ apiKey });
  }
  return providerCache.google as ReturnType<typeof createGoogleGenerativeAI>;
}

/**
 * 智谱 / Z.AI：默认 bigmodel.cn；设置 ZHIPU_BASE_URL 可走 Z.AI 国际站等自定义前缀。
 * @see https://github.com/Xiang-CH/zhipu-ai-provider
 */
function getZhipuProvider() {
  if (!providerCache.zhipu) {
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey)
      throw new Error("ZHIPU_API_KEY is required for zhipu provider");
    const baseURL = process.env.ZHIPU_BASE_URL?.trim();
    providerCache.zhipu = createZhipu(
      baseURL ? { baseURL, apiKey } : { apiKey }
    );
  }
  return providerCache.zhipu as ReturnType<typeof createZhipu>;
}

/**
 * 根据 modelId 返回对应的 LanguageModel，供 streamText / generateText 使用。
 * 优先从 chatModels 解析 provider，未找到则按 modelId 前缀推断。
 */
export function getModel(modelId: string): LanguageModel {
  const providerName = getProviderName(modelId);

  switch (providerName) {
    case "deepseek": {
      const provider = getDeepSeekProvider();
      return provider.chat(modelId) as LanguageModel;
    }
    case "xiaomi": {
      const provider = getXiaomiProvider();
      return provider.chat(modelId) as LanguageModel;
    }
    case "openai": {
      const provider = getOpenAIProvider();
      return provider.chat(modelId) as LanguageModel;
    }
    case "google": {
      const provider = getGoogleProvider();
      return provider.chat(modelId) as LanguageModel;
    }
    case "zhipu": {
      const zhipuProvider = getZhipuProvider();
      // zhipu-ai-provider 依赖 @ai-sdk/provider v2，与 ai@6 类型树并存时需断言
      return zhipuProvider.chat(modelId) as LanguageModel;
    }
    default: {
      const provider = getDeepSeekProvider();
      return provider.chat(modelId) as LanguageModel;
    }
  }
}
