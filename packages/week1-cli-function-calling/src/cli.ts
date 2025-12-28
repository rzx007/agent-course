#!/usr/bin/env node

import { loadEnv } from "./load-env.js";
import { Command } from "commander";
import { basicChat } from "./basic-chat.js";
import { renameFilesInDirectory } from "./file-renamer.js";

const program = new Command();
loadEnv();
program
  .name("week1-cli")
  .description("Week 1 CLI 工具 - 基础对话和文件重命名")
  .version("1.0.0")
  .exitOverride((err) => {
    // 当显示帮助信息时（没有提供命令或使用 --help），以退出码 0 退出
    if (
      err.code === "commander.helpDisplayed" ||
      err.code === "commander.missingCommand"
    ) {
      process.exit(0);
    }
    // 其他错误正常退出
    process.exit(err.exitCode || 1);
  });

program
  .command("basic-chat")
  .description("基础对话示例")
  .argument("[prompt]", "要发送给 AI 的提示", "你好，请介绍一下你自己")
  .option("-s, --stream", "启用流式输出", false)
  .action(async (prompt?: string, options?: { stream?: boolean }) => {
    try {
      // 如果没有提供 prompt，使用默认值
      const finalPrompt = prompt || "你好，请介绍一下你自己";

      if (options?.stream) {
        // 流式输出模式
        await basicChat(finalPrompt, undefined, { stream: true });
      } else {
        // 非流式输出模式
        const response = await basicChat(finalPrompt);
        console.log("\nAI 回复:");
        console.log(response);
      }
    } catch (error) {
      console.error("错误:", error);
      process.exit(1);
    }
  });

program
  .command("rename")
  .description("使用 AI 重命名文件夹中的文件")
  .requiredOption("-d, --dir <directory>", "要处理的目录路径")
  .option(
    "-i, --instruction <text>",
    "重命名指令",
    "请为这些文件提供更清晰、更有意义的命名"
  )
  .action(async (options) => {
    try {
      const { text, toolResults } = await renameFilesInDirectory(
        options.dir,
        options.instruction
      );

      console.log("\nAI 分析:");
      console.log(text);

      if (toolResults && toolResults.length > 0) {
        console.log("\n执行结果:");
        for (const toolCall of toolResults) {
          if (toolCall.toolName === "renameFile" && "output" in toolCall) {
            const results = (toolCall as any).output;
            if (Array.isArray(results)) {
              results.forEach((result: any) => {
                if (result.success) {
                  console.log(`✓ ${result.oldPath} -> ${result.newPath}`);
                } else {
                  console.log(`✗ ${result.oldPath}: ${result.error}`);
                }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("错误:", error);
      process.exit(1);
    }
  });

program.parse();
