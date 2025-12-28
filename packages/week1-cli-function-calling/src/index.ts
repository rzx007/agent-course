import { ModelMessage, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { loadEnv } from "./load-env";
import * as readline from "node:readline/promises";

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: ModelMessage[] = [];

async function gracefulExit() {
  console.log("\n\n再见！");
  terminal.close();
  process.exit(0);
}

// 处理 Ctrl+C
process.on("SIGINT", gracefulExit);

async function main() {
  loadEnv();
  console.log("聊天已启动。输入 'exit' 退出，或按 Ctrl+C。\n");

  while (true) {
    try {
      const userInput = await terminal.question("You: ");

      if (userInput.trim().toLowerCase() === "exit") {
        await gracefulExit();
        return;
      }

      if (!userInput.trim()) continue;

      messages.push({ role: "user", content: userInput });

      const openai = createOpenAI({
        baseURL: process.env.OPENAI_BASE_URL,
        apiKey: process.env.OPENAI_API_KEY,
      });

      const result = streamText({
        model: openai.chat("mimo-v2-flash"),
        messages,
      });

      let fullResponse = "";
      process.stdout.write("\nAssistant: ");
      for await (const delta of result.textStream) {
        fullResponse += delta;
        process.stdout.write(delta);
      }
      process.stdout.write("\n\n");

      messages.push({ role: "assistant", content: fullResponse });
    } catch (error) {
      if (error instanceof Error && error.message.includes("closed")) {
        await gracefulExit();
        return;
      }
      console.error("\n错误:", error instanceof Error ? error.message : error);
      // 如果出错，移除最后一条用户消息
      if (
        messages.length > 0 &&
        messages[messages.length - 1].role === "user"
      ) {
        messages.pop();
      }
    }
  }
}

main().catch(async (error) => {
  console.error("致命错误:", error);
  await gracefulExit();
});
