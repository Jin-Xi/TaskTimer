## Why

ChronoFlow 目前使用完全自定义的 Tailwind CSS 组件，随着功能增多，维护自定义组件的成本持续上升。HeroUI (NextUI) 提供了一套成熟的 React 组件库，内置 Framer Motion 动画、完善的可访问性支持，以及与现有 Tailwind 基础设施的兼容性。通过迁移到 HeroUI，可以加速未来功能开发、减少自定义组件维护负担，并获得更流畅的用户体验。

## What Changes

- **新增 HeroUI 依赖**
  - 安装 `@nextui-org/react` 及其 peer dependencies (`framer-motion` 等)

- **配置 HeroUI 主题系统**
  - 创建 `src/theme.ts` 扩展 HeroUI 主题以支持 ChronoFlow 品牌色板
  - 在 App.tsx 中配置 `NextUIProvider`

- **替换基础组件**
  - `Button` → HeroUI `<Button>`
  - `Badge` → HeroUI `<Chip>`
  - 自定义 Input/Select → HeroUI `<Input>`/`<Select>`
  - 自定义 Modal → HeroUI `<Modal>`

- **重构业务组件** (分阶段)
  - **Phase 1**: `AISettingsModal` - Modal + Input + Select + Button 组合
  - **Phase 2**: `TaskList` 任务卡片 - Card + Chip + Button 组合
  - **Phase 3**: 其他模态框组件 (`GuideModal`, AI 相关组件)
  - **Phase 4**: 复杂组件适配 (`TaskTimer`, `ProjectManager`, `Stats`)

- **保留现有内容**
  - `Stats` 组件继续使用 Recharts (HeroUI 不提供图表组件)
  - `Lucide React` 图标库继续使用
  - 现有的 Tailwind 配置作为 HeroUI 主题的补充
  - 所有业务逻辑和数据层代码不变

- **移除代码**
  - `src/components/Button.tsx` (替换后删除)
  - `src/components/Badge.tsx` (替换后删除)
  - 各组件中自定义的 modal 容器代码

## Capabilities

### New Capabilities

- `heroui-integration`: HeroUI 组件库集成与主题配置
  - HeroUI 依赖安装与配置
  - ChronoFlow 品牌色板映射到 HeroUI 主题系统
  - 深色模式自动支持

- `heroui-base-components`: HeroUI 基础组件替换
  - Button, Input, Select, Modal, Chip 等基础组件的 HeroUI 实现
  - 组件 API 适配与样式定制

### Modified Capabilities

- `task-management-ui`: 任务管理界面组件
  - **REQUIREMENT CHANGE**: TaskList 任务卡片使用 HeroUI Card 组件重构
  - 交互行为保持一致，视觉样式跟随 HeroUI 设计语言

- `settings-ui`: 设置界面组件
  - **REQUIREMENT CHANGE**: AISettingsModal 使用 HeroUI Modal 组件重构
  - 表单交互保持一致，动画效果由 Framer Motion 提供

## Impact

### 代码影响

- **新增文件**
  - `src/theme.ts` - HeroUI 主题配置
  - `src/components/HeroUI*.tsx` - 可能需要封装组件

- **修改文件**
  - `src/App.tsx` - 添加 NextUIProvider
  - `tailwind.config.js` - 可能需要调整以配合 HeroUI
  - `src/components/AISettingsModal.tsx` - 完全重写
  - `src/components/TaskList.tsx` - 部分重写
  - 所有使用 Button/Badge 的组件 - 需要适配新 API

- **删除文件**
  - `src/components/Button.tsx` (Phase 2 删除)
  - `src/components/Badge.tsx` (Phase 2 删除)

### 依赖影响

- **新增依赖**
  - `@nextui-org/react` - 核心组件库 (~40KB gzipped)
  - `framer-motion` - 动画库 (HeroUI peer dependency)

- **保留依赖**
  - `react` / `react-dom` - 版本兼容 (HeroUI 支持 React 19)
  - `tailwindcss` - HeroUI 基于 Tailwind
  - `lucide-react` - 图标继续使用
  - `recharts` - 图表库保留

### Bundle 大小影响

- 预估增加: ~40KB gzipped (HeroUI + Framer Motion)
- 当前大小: ~50KB gzipped
- 迁移后总计: ~90KB gzipped

### 风险与缓解

| 风险 | 缓解措施 |
|------|----------|
| HeroUI 样式定制限制 | 创建封装组件保留品牌特色 |
| 组件 API 差异导致功能丢失 | 原型验证阶段确认所有功能可实现 |
| 迁移过程中 UI 回退 | 分阶段迁移，每阶段独立测试 |
| 深色模式兼容问题 | 使用 HeroUI 内置暗色模式系统 |
