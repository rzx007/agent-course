import { loadEnv } from "./load-env.js";
loadEnv();

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * 文件重命名工具
 * 使用 Function Calling 让 AI 帮助重命名文件
 */

const renameFileSchema = z.object({
  oldPath: z.string().describe("原文件路径"),
  newPath: z.string().describe("新文件路径"),
});

export async function renameFilesInDirectory(
  directoryPath: string,
  instruction: string
) {
  // 读取目录中的所有文件
  const files = await fs.readdir(directoryPath);
  const fileList = files.map((file) => `- ${file}`).join("\n");

  const prompt = `你是一个文件重命名助手。当前目录中有以下文件：

${fileList}

用户要求：${instruction}

请为这些文件提供更好的命名建议。对于每个需要重命名的文件，返回原路径和新路径。`;

  // 创建 OpenAI provider
  const openai = createOpenAI({
    baseURL: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { text, toolCalls, toolResults } = await generateText({
    // 使用 chat() 方法强制使用 Chat Completions API (/v1/chat/completions)
    model: openai.chat("mimo-v2-flash"),
    prompt,
    tools: {
      renameFile: {
        description: "重命名一个文件",
        inputSchema: z.object({
          files: z.array(renameFileSchema).describe("要重命名的文件列表"),
        }),
        execute: async ({ files }) => {
          const results = [];
          for (const file of files) {
            try {
              const oldPath = path.join(directoryPath, file.oldPath);
              const newPath = path.join(directoryPath, file.newPath);

              // 检查原文件是否存在
              await fs.access(oldPath);

              // 执行重命名
              await fs.rename(oldPath, newPath);
              console.log(`重命名成功: ${oldPath} -> ${newPath}`);
              results.push({
                success: true,
                oldPath: file.oldPath,
                newPath: file.newPath,
              });
            } catch (error) {
              results.push({
                success: false,
                oldPath: file.oldPath,
                newPath: file.newPath,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }
          return results;
        },
      },
    },
  });

  return { text, toolCalls, toolResults };
}
