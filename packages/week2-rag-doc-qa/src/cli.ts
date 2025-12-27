#!/usr/bin/env node

import { loadEnv } from './load-env.js';
loadEnv();

import { Command } from 'commander';
import * as readline from 'readline';
import * as path from 'path';
import * as fs from 'fs/promises';
import { loadDocument, chunkDocument } from './document-loader.js';
import { VectorStoreManager } from './vector-store.js';
import { QABot } from './qa-bot.js';

const program = new Command();

program
  .name('week2-rag-qa')
  .description('Week 2 RAG 文档问答机器人')
  .version('1.0.0');

program
  .command('ingest')
  .description('导入文档到向量数据库')
  .option('-f, --file <path>', '要导入的文档路径', './README.md')
  .action(async (options) => {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        console.error('错误: 请设置 DATABASE_URL 环境变量');
        process.exit(1);
      }

      console.log('正在初始化向量存储...');
      const vectorStore = new VectorStoreManager(dbUrl);
      await vectorStore.initialize();

      console.log(`正在读取文档: ${options.file}`);
      const content = await loadDocument(options.file);

      console.log('正在切片文档...');
      const chunks = chunkDocument(content);

      console.log(`文档已切分为 ${chunks.length} 个块`);

      console.log('正在生成向量并存储...');
      await vectorStore.addDocuments(
        chunks,
        chunks.map((_, index) => ({
          source: path.basename(options.file),
          chunkIndex: index,
        }))
      );

      console.log('✓ 文档导入完成！');
      await vectorStore.close();
    } catch (error) {
      console.error('错误:', error);
      process.exit(1);
    }
  });

program
  .command('chat')
  .description('启动交互式问答')
  .action(async () => {
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        console.error('错误: 请设置 DATABASE_URL 环境变量');
        process.exit(1);
      }

      const vectorStore = new VectorStoreManager(dbUrl);
      await vectorStore.initialize();
      const qaBot = new QABot(vectorStore);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      console.log('文档问答机器人已启动！输入 "exit" 或 "quit" 退出。\n');

      const askQuestion = () => {
        rl.question('你的问题: ', async (question) => {
          if (question.toLowerCase() === 'exit' || question.toLowerCase() === 'quit') {
            console.log('再见！');
            await vectorStore.close();
            rl.close();
            return;
          }

          if (!question.trim()) {
            askQuestion();
            return;
          }

          try {
            console.log('\n正在思考...');
            const answer = await qaBot.answer(question);
            console.log('\n回答:');
            console.log(answer);
            console.log('\n');
          } catch (error) {
            console.error('错误:', error);
          }

          askQuestion();
        });
      };

      askQuestion();
    } catch (error) {
      console.error('错误:', error);
      process.exit(1);
    }
  });

program.parse();

