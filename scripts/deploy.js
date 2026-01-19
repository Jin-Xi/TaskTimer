
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 手动读取 .env 文件，避免引入 dotenv 依赖
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    // 简单的键值对解析
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      // 去除引号
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const { 
  DEPLOY_HOST, 
  DEPLOY_USER, 
  DEPLOY_PATH, 
  DEPLOY_KEY, 
  DEPLOY_PORT 
} = process.env;

// 检查必要配置
if (!DEPLOY_HOST || !DEPLOY_USER || !DEPLOY_PATH) {
  console.error('\x1b[31m%s\x1b[0m', '❌ 错误: .env 文件中缺少部署配置。');
  console.log('\x1b[33m%s\x1b[0m', '请确保配置了以下变量:');
  console.log('  DEPLOY_HOST=服务器IP');
  console.log('  DEPLOY_USER=用户名');
  console.log('  DEPLOY_PATH=远程目录路径');
  console.log('  DEPLOY_KEY=私钥路径 (可选)');
  console.log('  DEPLOY_PORT=端口 (可选, 默认22)');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', '🔨 正在构建项目 (npm run build)...');

try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (e) {
  console.error('\x1b[31m%s\x1b[0m', '❌ 构建失败，终止部署。');
  process.exit(1);
}

console.log('\x1b[36m%s\x1b[0m', `🚀 正在上传至 ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}...`);

// 构建 scp 命令
const portArg = DEPLOY_PORT ? `-P ${DEPLOY_PORT}` : '';
const keyArg = DEPLOY_KEY ? `-i "${DEPLOY_KEY}"` : '';
// 注意: dist/* 依赖于 Shell 的通配符扩展，Windows CMD 可能不支持，建议在 Git Bash 或 PowerShell 中运行
const cmd = `scp -r ${portArg} ${keyArg} dist/* ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}`;

try {
  // shell: true 允许在 shell 中执行命令，支持通配符
  execSync(cmd, { stdio: 'inherit', shell: true });
  console.log('\x1b[32m%s\x1b[0m', '✅ 部署成功！');
} catch (e) {
  console.error('\x1b[31m%s\x1b[0m', '❌ 上传失败。请检查网络连接、权限配置或 .env 路径配置。');
  console.error(e.message);
  process.exit(1);
}
