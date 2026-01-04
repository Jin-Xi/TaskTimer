
# ChronoFlow 部署指南 (工程化版本)

本项目已升级为基于 **Vite** 的现代化 React 工程。现在支持自动构建、单元测试和环境变量管理。

## 1. 本地开发环境准备

1.  **安装 Node.js**: 确保已安装 Node.js 18+。
2.  **获取代码**: 下载本项目所有文件到本地文件夹。
3.  **安装依赖**:
    ```bash
    npm install
    ```

## 2. 配置环境变量

在项目根目录新建 `.env` 文件：
```env
VITE_API_KEY=你的_GOOGLE_GEMINI_API_KEY
```

## 3. 开发与测试

*   **启动开发服务器**:
    ```bash
    npm run dev
    ```
    访问 `http://localhost:5173`。
*   **运行自动化测试**:
    ```bash
    npm run test
    ```
    这将执行 `services/storageService.test.ts` 中的逻辑验证。

## 4. 生产环境打包与部署

### 第一步：构建
执行以下命令，这会进行类型检查并将代码打包到 `dist` 目录：
```bash
npm run build
```

### 第二步：部署到托管平台

#### 方案 A: Vercel (推荐)
1. 安装 Vercel CLI: `npm i -g vercel`
2. 执行 `vercel` 并按照提示操作。
3. 在 Vercel 控制面板中添加环境变量 `VITE_API_KEY`。

#### 方案 B: GitHub Pages
1. 在 `vite.config.ts` 中添加 `base: '/your-repo-name/'`。
2. 执行 `npm run build`。
3. 将 `dist` 文件夹的内容上传到 GitHub 仓库的 `gh-pages` 分支。

## 5. 关键技术栈
*   **Vite 6**: 下一代前端开发与构建工具。
*   **Vitest**: 兼容 Vite 的高性能测试框架。
*   **TypeScript**: 提供静态类型检查，减少运行时错误。
*   **Tailwind CSS (JIT)**: 按需生成的原子化 CSS，性能最优。
