# ChronoFlow - AI 驱动的任务计时与效率追踪器

ChronoFlow 是一款基于 React 19 和 Vite 构建的现代化效率管理应用。它不仅提供精准的任务计时功能，还引入了项目流规划、可视化数据分析以及基于 Google Gemini 的 AI 生产力教练，帮助您深度掌控时间。

## ✨ 核心功能

-   **⏱️ 智能任务计时**: 毫秒级精准计时，支持随时暂停、恢复及完成任务。
-   **🌿 里程碑与分支系统**: 在任务执行过程中记录关键节点（里程碑），支持模拟 Git 分支管理思路，清晰展示任务演进过程。
-   **📅 项目工作流规划**: 定义复杂的项目结构，支持任务间的**前置依赖**逻辑（父任务完成后方可开启子任务计时）。
-   **🧘 沉浸式专注模式**: 全屏计时界面，支持自定义背景图，帮助您进入“心流”状态。
-   **📊 深度数据可视化**: 通过 Recharts 渲染耗时分布图、标签统计图及每日效率指标。
-   **🤖 AI 生产力教练**: 集成 Google Gemini 3 Flash，根据您的真实耗时记录，自动生成效率评估分数、总结及改进建议。
-   **🌗 极简 UI/UX**: 支持深色/浅色模式切换，响应式设计，完美适配 PC 与移动端。
-   **🌍 多语言支持**: 完整支持中英文一键切换。
-   **💾 数据自主可控**: 数据持久化存储于本地（LocalStorage），并支持 JSON 格式的导出备份与导入。

## 🛠️ 技术栈

-   **框架**: React 19 (TypeScript)
-   **构建工具**: Vite 6
-   **样式**: Tailwind CSS
-   **图标**: Lucide React
-   **图表**: Recharts
-   **AI SDK**: @google/genai (Gemini API)
-   **测试**: Vitest

## 🚀 快速开始

### 1. 克隆并安装依赖
```bash
npm install
```

### 2. 配置 API 密钥
在项目根目录创建 `.env` 文件，用于启用 AI 分析功能：
```env
VITE_API_KEY=你的_GOOGLE_GEMINI_API_KEY
```

### 3. 启动开发服务器
```bash
npm run dev
```
访问 `http://localhost:5173` 即可开始使用。

### 4. 运行测试
```bash
npm run test
```

## 📂 文件结构说明

-   `/components`: UI 核心组件（计时器、列表、统计、AI 界面、项目管理等）。
-   `/services`: 逻辑服务层，包括 `geminiService`（AI 交互）和 `storageService`（本地存储）。
-   `types.ts`: 全局 TypeScript 类型定义。
-   `constants.ts`: 包含 UI 文字翻译、导航配置及颜色常量。
-   `index.css`: Tailwind 基础指令及全局模式背景定义。

---

## 🛡️ 数据隐私
您的任务名称、描述和计时数据仅存储在您的浏览器本地。只有当您主动点击“AI 分析”时，脱敏后的任务摘要才会发送至 Google Gemini API 进行处理。详情请参阅 [AI 洞察指南](./AI_ANALYSIS_GUIDE.md)。
