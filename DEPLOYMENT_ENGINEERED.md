# ChronoFlow 工程化部署手册

本项目已完全迁移至现代化的工程化架构。以下是构建、测试及部署到生产环境的详细步骤。

## 🛠️ 构建命令

在开始之前，请确保已运行 `npm install` 安装了所有必需的依赖项。

| 命令 | 说明 |
| :--- | :--- |
| `npm run dev` | 启动 Vite 开发服务器，支持热更新（HMR）。 |
| `npm run build` | 执行 TypeScript 类型检查并进行生产环境代码混淆压缩。 |
| `npm run preview` | 本地预览生产环境构建后的效果（dist 目录）。 |
| `npm run test` | 启动 Vitest 运行单元测试。 |

## 🌐 部署至生产环境

### 1. 环境变量配置 (关键)
无论使用何种平台，请务必设置以下环境变量，否则 AI 分析功能将无法使用：
-   `VITE_API_KEY`: 您的 Google Gemini API Key。

### 2. 托管平台推荐

#### 方案 A: Vercel (首选)
由于项目是基于 Vite 的标准 React 应用，Vercel 会自动识别并配置：
1.  关联 GitHub 仓库。
2.  在 Vercel 仪表盘的 **Project Settings -> Environment Variables** 中添加 `VITE_API_KEY`。
3.  点击 **Deploy**。

#### 方案 B: GitHub Pages
1.  在 `vite.config.ts` 中配置 `base` 路径（例如 `base: '/ChronoFlow/'`）。
2.  在 GitHub Action 中添加构建脚本。
3.  将生成好的 `dist` 文件夹内容推送到 `gh-pages` 分支。

#### 方案 C: 私有服务器
1.  运行 `npm run build`。
2.  将生成的 `dist` 文件夹内容上传至 Nginx 或 Apache 的静态资源目录。
3.  确保 Nginx 配置了正确的 SPA 路由重定向（将 404 指向 index.html）。

## 🧪 持续集成
本项目包含 `services/storageService.test.ts`。建议在 CI 流程中加入 `npm run test`，以确保每次代码提交都不会破坏核心的数据存储逻辑。

## 📌 提示
生产环境下，应用开启了 **Source Maps**（可在 `vite.config.ts` 中关闭），以便于在生产环境中排查逻辑错误。
