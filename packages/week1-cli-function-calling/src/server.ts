import { loadEnv } from './load-env.js';
loadEnv();

import express from 'express';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';
import type { LanguageModelV1 } from 'ai';

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON 请求体
app.use(express.json());

// 创建 OpenAI provider
const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const model = openai.chat('mimo-v2-flash') as unknown as LanguageModelV1;

// 方式1: 普通流式输出（纯文本，chunked transfer）
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { prompt, baseURL } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: '缺少 prompt 参数' });
    }

    // 如果提供了自定义 baseURL，创建新的 provider
    const currentModel = baseURL
      ? (createOpenAI({
          baseURL,
          apiKey: process.env.OPENAI_API_KEY,
        }).chat('mimo-v2-flash') as unknown as LanguageModelV1)
      : model;

    const result = streamText({
      model: currentModel,
      prompt,
    });

    // 设置响应头，支持流式输出
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // 流式输出文本
    const textStream = (result as any).textStream as AsyncIterable<string>;
    for await (const textPart of textStream) {
      res.write(textPart);
    }

    res.end();
  } catch (error) {
    console.error('流式输出错误:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '服务器错误' });
    } else {
      res.end();
    }
  }
});

// 方式2: SSE 格式流式输出（Server-Sent Events）
app.post('/api/chat/stream/sse', async (req, res) => {
  try {
    const { prompt, baseURL } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: '缺少 prompt 参数' });
    }

    // 如果提供了自定义 baseURL，创建新的 provider
    const currentModel = baseURL
      ? (createOpenAI({
          baseURL,
          apiKey: process.env.OPENAI_API_KEY,
        }).chat('mimo-v2-flash') as unknown as LanguageModelV1)
      : model;

    const result = streamText({
      model: currentModel,
      prompt,
    });

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲

    // 流式输出文本（SSE 格式）
    const textStream = (result as any).textStream as AsyncIterable<string>;
    for await (const textPart of textStream) {
      // SSE 格式：data: {content}\n\n
      res.write(`data: ${JSON.stringify({ text: textPart })}\n\n`);
    }

    // 发送结束标记
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('SSE 流式输出错误:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '服务器错误' });
    } else {
      res.write(`data: ${JSON.stringify({ error: '服务器错误' })}\n\n`);
      res.end();
    }
  }
});

// 方式3: 使用 AI SDK 内置的 pipeTextStreamToResponse 方法
app.post('/api/chat/stream/pipe', async (req, res) => {
  try {
    const { prompt, baseURL } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: '缺少 prompt 参数' });
    }

    // 如果提供了自定义 baseURL，创建新的 provider
    const currentModel = baseURL
      ? (createOpenAI({
          baseURL,
          apiKey: process.env.OPENAI_API_KEY,
        }).chat('mimo-v2-flash') as unknown as LanguageModelV1)
      : model;

    const result = streamText({
      model: currentModel,
      prompt,
    });

    // 使用 AI SDK 内置方法直接流式输出到响应
    (result as any).pipeTextStreamToResponse(res);
  } catch (error) {
    console.error('Pipe 流式输出错误:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '服务器错误' });
    }
  }
});

// 非流式输出接口
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, baseURL } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: '缺少 prompt 参数' });
    }

    // 如果提供了自定义 baseURL，创建新的 provider
    const currentModel = baseURL
      ? (createOpenAI({
          baseURL,
          apiKey: process.env.OPENAI_API_KEY,
        }).chat('mimo-v2-flash') as unknown as LanguageModelV1)
      : model;

    const { text } = await generateText({
      model: currentModel,
      prompt,
    });

    res.json({ text });
  } catch (error) {
    console.error('生成文本错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`\n流式输出接口:`);
  console.log(`  方式1 (普通流式): POST http://localhost:${PORT}/api/chat/stream`);
  console.log(`  方式2 (SSE格式):  POST http://localhost:${PORT}/api/chat/stream/sse`);
  console.log(`  方式3 (Pipe方法): POST http://localhost:${PORT}/api/chat/stream/pipe`);
  console.log(`\n普通接口:`);
  console.log(`  POST http://localhost:${PORT}/api/chat`);
  console.log(`\n健康检查:`);
  console.log(`  GET http://localhost:${PORT}/health`);
});