# Motion Polish 2025 - 提案

## Why

当前应用的交互体验较为生硬 - 所有状态切换都是瞬间完成的，没有过渡动画。用户点击按钮、切换标签页、完成任务时，界面立即突变，缺乏流畅感。这影响了应用的视觉品质和用户体验，使其感觉不够精致。

随着 Framer Motion v12 已作为 HeroUI v2 的依赖被引入项目，我们有了一个绝佳的机会来提升交互体验，而无需额外增加依赖。

## What Changes

### 核心改动

- **Tab 切换动画**: 使用 `AnimatePresence` 实现标签页内容的淡入淡出和滑动过渡
- **列表项交错动画**: 任务列表中的项目依次出现，而不是同时显示
- **按钮点击反馈**: 按钮按下时轻微缩小 (`whileTap={{ scale: 0.95 }}`)
- **Spring 物理效果**: 使用弹性曲线替代线性过渡，让动画更有生命力
- **微交互增强**: Hover 状态的平滑过渡，ripple 效果等

### 技术实施

- **直接使用 Framer Motion**: 虽然通过 HeroUI 引入，但直接从 `framer-motion` 导入使用
- **创建可复用动画组件**: `AnimatedPage`, `StaggeredList`, `MotionButton` 等
- **统一动画参数**: 定义 spring 常量，确保全站动画风格一致
- **性能优化**: 大列表使用虚拟滚动时减少动画元素

### 性能与兼容性

- **prefers-reduced-motion 支持**: 尊重用户的动画偏好设置
- **性能监控**: 避免过度动画导致的性能问题
- **渐进增强**: 动画失效时不影响核心功能

## Capabilities

### New Capabilities

- **ui-animations**: UI 动画系统，包括页面过渡、列表动画、按钮反馈等交互动画能力

### Modified Capabilities

无（本次变更不改变现有功能规格，仅增强交互体验）

## Impact

### 受影响的文件

**新建文件**:
- `src/components/animations/AnimatedPage.tsx` - 页面切换动画容器
- `src/components/animations/StaggeredList.tsx` - 列表交错动画包装器
- `src/animations/springs.ts` - Spring 参数常量配置
- `src/animations/variants.ts` - 通用动画变体配置

**修改文件**:
- `src/App.tsx` - 主应用入口，Tab 切换动画集成
- `src/components/TaskList.tsx` - 任务列表动画增强
- `src/components/ProjectManager.tsx` - 项目管理动画增强
- `src/index.css` - 动画相关的 CSS 补充（如 reduced-motion）

### 依赖项

- **已有依赖**: `framer-motion@^12.35.0` (通过 HeroUI v2 引入)
- **新增依赖**: 无

### 预期工作量

- **总工时**: 约 8-12 小时
- **实施周期**: 2 周
- **风险等级**: 低 (纯视觉增强，不影响核心功能)
