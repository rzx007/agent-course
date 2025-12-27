import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * 文档加载器
 * 读取 README.md 文件并准备切片
 */
export async function loadDocument(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`无法读取文件 ${filePath}: ${error}`);
  }
}

/**
 * 文档切片
 * 将长文档切分成适合向量化的块
 */
export function chunkDocument(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);

    // 尝试在句号、换行符等位置切分
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const splitPoint = Math.max(lastPeriod, lastNewline);

      if (splitPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, splitPoint + 1);
        start += splitPoint + 1 - chunkOverlap;
      } else {
        start += chunkSize - chunkOverlap;
      }
    } else {
      start = text.length;
    }

    chunks.push(chunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

