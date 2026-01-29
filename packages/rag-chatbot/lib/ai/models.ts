export const DEFAULT_CHAT_MODEL = "mimo-v2-flash";

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "deepseek-chat",
    name: "Deepseek V3.2",
    provider: "deepseek",
    description: "deepseek V3.2 model",
  },
  {
    id: "deepseek-reasoner",
    name: "Deepseek Reasoner",
    provider: "deepseek",
    description: "deepseek reasoner",
  },
  {
    id: "mimo-v2-flash",
    name: "XiaoMi Mimo",
    provider: "xiaomi",
    description: "Fast and cost-effective for simple tasks",
  },
];
