import { LanguageModelV3 } from '@ai-sdk/provider';
import { OpenAICompatibleChatLanguageModel } from '@ai-sdk/openai-compatible';
import {
  FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';

/**
 * XiaomiMimo 支持的聊天模型 ID
 * 根据 https://platform.xiaomimimo.com 文档定义
 */
export type XiaomiMimoChatModelId =
  | 'mimo-v2-flash'
  | 'mimo-v2'
  | (string & {});

/**
 * XiaomiMimo Provider 配置选项
 */
export interface XiaomiMimoProviderSettings {
  /**
   * API 密钥
   */
  apiKey?: string;
  /**
   * API 基础 URL
   * 默认: https://api.xiaomimimo.com/v1
   */
  baseURL?: string;
  /**
   * 自定义请求头
   */
  headers?: Record<string, string>;
  /**
   * 自定义 URL 查询参数
   */
  queryParams?: Record<string, string>;
  /**
   * 自定义 fetch 实现
   */
  fetch?: FetchFunction;
}

/**
 * XiaomiMimo Provider 接口
 */
export interface XiaomiMimoProvider {
  /**
   * 创建聊天模型
   */
  (modelId: XiaomiMimoChatModelId): LanguageModelV3;
  /**
   * 创建聊天模型（显式方法）
   */
  chatModel(modelId: XiaomiMimoChatModelId): LanguageModelV3;
}

/**
 * 创建 XiaomiMimo Provider 实例
 */
export function createXiaomiMimo(
  options: XiaomiMimoProviderSettings = {},
): XiaomiMimoProvider {
  const baseURL = withoutTrailingSlash(
    options.baseURL ?? 'https://api.xiaomimimo.com/v1',
  );

  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: 'XIAOMIMIMO_API_KEY',
      description: 'XiaomiMimo API key',
    })}`,
    ...options.headers,
  });

  const createChatModel = (modelId: XiaomiMimoChatModelId) => {
    return new OpenAICompatibleChatLanguageModel(modelId, {
      provider: 'xiaomimimo.chat',
      url: ({ path }) => {
        const url = new URL(`${baseURL}${path}`);
        if (options.queryParams) {
          url.search = new URLSearchParams(options.queryParams).toString();
        }
        return url.toString();
      },
      headers: getHeaders,
      fetch: options.fetch,
    });
  };

  const provider = (modelId: XiaomiMimoChatModelId) =>
    createChatModel(modelId);

  provider.chatModel = createChatModel;

  return provider;
}

/**
 * 默认 XiaomiMimo Provider 实例
 */
export const xiaomimimo = createXiaomiMimo();

