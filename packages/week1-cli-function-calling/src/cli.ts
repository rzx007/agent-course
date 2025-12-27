#!/usr/bin/env node

import { Command } from 'commander';
import { basicChat } from './basic-chat.js';
import { renameFilesInDirectory } from './file-renamer.js';

const program = new Command();

program
  .name('week1-cli')
  .description('Week 1 CLI 工具 - 基础对话和文件重命名')
  .version('1.0.0');

program
  .command('basic-chat')
  .description('基础对话示例')
  .argument('<prompt>', '要发送给 AI 的提示')
  .action(async (prompt: string) => {
    try {
      const response = await basicChat(prompt);
      console.log('\nAI 回复:');
      console.log(response);
    } catch (error) {
      console.error('错误:', error);
      process.exit(1);
    }
  });

program
  .command('rename')
  .description('使用 AI 重命名文件夹中的文件')
  .requiredOption('-d, --dir <directory>', '要处理的目录路径')
  .option('-i, --instruction <text>', '重命名指令', '请为这些文件提供更清晰、更有意义的命名')
  .action(async (options) => {
    try {
      const { text, toolCalls } = await renameFilesInDirectory(
        options.dir,
        options.instruction
      );
      
      console.log('\nAI 分析:');
      console.log(text);
      
      if (toolCalls && toolCalls.length > 0) {
        console.log('\n执行结果:');
        for (const toolCall of toolCalls) {
          if (toolCall.toolName === 'renameFile') {
            const results = toolCall.result;
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
      console.error('错误:', error);
      process.exit(1);
    }
  });

program.parse();

