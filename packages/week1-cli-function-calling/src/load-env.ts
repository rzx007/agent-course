import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

/**
 * 加载环境变量
 * 优先加载根目录的 .env 文件，如果存在子项目的 .env 文件也会加载（会覆盖根目录的值）
 */
export function loadEnv() {
  // 获取当前文件的目录（ES modules 兼容）
  const currentFile = import.meta.url;
  const currentDir = path.dirname(fileURLToPath(currentFile));
  
  // 向上查找根目录（包含 pnpm-workspace.yaml 的目录）
  let rootDir = currentDir;
  while (rootDir !== path.dirname(rootDir)) {
    const workspaceFile = path.join(rootDir, 'pnpm-workspace.yaml');
    if (fs.existsSync(workspaceFile)) {
      break;
    }
    rootDir = path.dirname(rootDir);
  }
  
  // 加载根目录的 .env 文件
  const rootEnvPath = path.join(rootDir, '.env');
  if (fs.existsSync(rootEnvPath)) {
    config({ path: rootEnvPath });
  }
  
  // 加载子项目的 .env 文件（如果存在，会覆盖根目录的值）
  const localEnvPath = path.join(currentDir, '..', '.env');
  if (fs.existsSync(localEnvPath)) {
    config({ path: localEnvPath, override: false });
  }
}

