export const DEFAULT_CHAT_MODEL = "mimo-v2-flash";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "deepseek-chat",
    name: "Deepseek V3.2",
    provider: "deepseek",
    description: "deepseek V3.2 model",
    icon: "deepseek-color.svg",
  },
  {
    id: "deepseek-reasoner",
    name: "Deepseek Reasoner",
    provider: "deepseek",
    description: "deepseek reasoner",
    icon: "deepseek-color.svg",
  },
  {
    id: "glm-4.7-flash", // 使用 zhipu GLM-4.7 系列
    name: "智谱 GLM-4.7 Flash",
    provider: "zhipu",
    description: "智谱 GLM-4 Flash",
    icon: "zhipu-color.svg",
  },
  {
    id: "glm-4.7",
    name: "智谱 GLM-4.7",
    provider: "zhipu",
    description: "智谱 GLM-4.7",
    icon: "zhipu-color.svg",
  },
  {
    id: "mimo-v2-flash",
    name: "XiaoMi Mimo",
    provider: "xiaomi",
    description: "Fast and cost-effective for simple tasks",
    icon: "xiaomimimo.svg",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "OpenAI GPT-4o",
    icon: "openai.svg",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "OpenAI GPT-4o Mini",
    icon: "openai.svg",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    description: "Google Gemini 1.5 Pro",
    icon: "gemini-color.svg",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    description: "Google Gemini 1.5 Flash",
    icon: "gemini-color.svg",
  },

];
