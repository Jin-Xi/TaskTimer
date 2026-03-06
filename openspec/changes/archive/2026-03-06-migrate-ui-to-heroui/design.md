## Context

ChronoFlow 是一个 React 19 + TypeScript 生产力应用，当前使用完全自定义的 Tailwind CSS 组件。现有架构包含：

- **基础组件**: `Button.tsx`, `Badge.tsx` - 约 100 行自定义代码
- **业务组件**: 14 个组件，如 `TaskTimer.tsx`, `TaskList.tsx`, `AISettingsModal.tsx` 等
- **样式系统**: 精心设计的 ChronoFlow 品牌色板（绿色主题 + ochre/terracotta/slate-river 语义色）
- **深色模式**: 手动实现，使用 Tailwind `dark:` 类
- **动画**: 部分使用 Tailwind `animate-in` 类，部分自定义 CSS transition

**约束条件**:
- 必须保持 ChronoFlow 品牌视觉识别
- 不能影响业务逻辑和数据层
- 需要支持 React 19 (HeroUI 支持最新版本)
- Bundle 大小增长需控制在可接受范围

**技术栈当前状态**:
```
依赖树:
├── react@19.0.0 + react-dom@19.0.0
├── tailwindcss@3.4.1
├── lucide-react@0.460.0 (图标)
└── recharts@2.13.3 (图表)

自定义组件:
├── Button (4 variants: primary/secondary/danger/ghost)
├── Badge (动态颜色映射)
├── 各种 Modal 容器 (手动实现)
└── Input/Select (原生 HTML + Tailwind)
```

## Goals / Non-Goals

**Goals:**
- 替换基础组件 (Button, Badge, Modal, Input, Select) 为 HeroUI 等价组件
- 配置 HeroUI 主题以保留 ChronoFlow 品牌色板
- 分阶段迁移业务组件，降低风险
- 利用 Framer Motion 获得更流畅的动画效果
- 提升代码可维护性和未来开发速度

**Non-Goals:**
- 不改变业务逻辑和数据层代码
- 不替换 Recharts (Stats 组件继续使用)
- 不改变 Lucide React 图标库
- 不重新设计整体视觉风格 (保持现有设计语言)
- 不迁移 TaskTimer 的可调整分隔面板 (HeroUI 无原生支持，保留自定义实现)

## Decisions

### 1. 选择 HeroUI (NextUI) 而非其他 UI 库

**决策**: 使用 `@nextui-org/react` 作为 UI 组件库

**理由**:
- 基于 Tailwind CSS，与现有基础设施完美兼容
- 内置 Framer Motion，动画效果更丰富
- 完整的主题系统，支持深度定制
- 活跃的社区和良好的文档
- 原生支持 React 19

**其他考虑的选项**:
- `shadcn/ui`: 基于 Radix UI，但需要更多配置工作
- `Mantine`: 功能强大但设计语言较难定制
- `Ant Design`: 设计风格与 ChronoFlow 差异较大
- `Chakra UI`: 动画系统不如 Framer Motion 强大

### 2. 分阶段迁移策略

**决策**: 按优先级分 4 个阶段迁移组件

**阶段划分**:
```
Phase 1 (低风险验证):
├── AISettingsModal
└── 包含: Modal, Input, Select, Button

Phase 2 (基础组件替换):
├── Button.tsx → 删除
├── Badge.tsx → 删除
└── 全局替换新组件引用

Phase 3 (中等复杂度):
├── TaskList 任务卡片
├── GuideModal
└── AI 相关组件 (AIInsights, AIProjectGenerator)

Phase 4 (高复杂度/可选):
├── TaskTimer (分隔面板保留自定义)
├── ProjectManager
└── FullscreenFocus
```

**理由**: 降低风险，每个阶段独立测试，出现问题可快速回滚

### 3. 主题配置方案

**决策**: 在 `src/theme.ts` 扩展 HeroUI 主题，保留完整品牌色板

**实现方式**:
```tsx
// 使用 HeroUI 的 extendTheme 扩展默认主题
const chronoFlowTheme = extendTheme({
  colors: {
    // 映射 ChronoFlow 色板到 HeroUI color system
    green: { /* ... */ },
    ochre: { /* ... */ },
    terracotta: { /* ... */ },
    'slate-river': { /* ... */ },
  },
});
```

**理由**:
- 保留品牌视觉识别
- 支持 HeroUI 的 `color="green"` 等 props
- 深色模式自动支持 (HeroUI 内置)

### 4. 组件封装策略

**决策**: 对复杂场景创建封装组件，简单场景直接使用 HeroUI

**封装原则**:
```
直接使用 HeroUI:
├── 简单 Button
├── 简单 Input
├── 简单 Modal
└── 基础场景

创建封装组件:
├── TaskCard (Card + 复杂状态逻辑)
├── ProviderSelector (特殊布局的按钮组)
└── 任何需要特殊交互或样式的组件
```

**理由**: 平衡开发效率和灵活性

### 5. 保留 Recharts 图表库

**决策**: Stats 组件继续使用 Recharts，不替换为 HeroUI 方案

**理由**: HeroUI 不提供图表组件，Recharts 已经很好地满足需求

## Risks / Trade-offs

### 风险 1: HeroUI 样式定制可能限制设计自由度

**缓解措施**:
- 使用 `classNames` prop 覆盖默认样式
- 对关键组件创建封装层
- 保留 `tailwind.config.js` 作为补充

### 风险 2: 组件 API 差异导致功能丢失

**缓解措施**:
- 原型验证阶段 (Phase 1) 确认所有功能可实现
- 详细记录当前组件的所有使用场景
- 保留旧组件代码直到完全迁移完成

### 风险 3: Bundle 大小增加 ~40KB

**缓解措施**:
- 使用 Tree-shaking，只导入使用的组件
- 评估后可接受 (当前 50KB → 迁移后 90KB)
- 考虑长期收益 (减少自定义代码)

### 风险 4: 深色模式兼容问题

**缓解措施**:
- 使用 HeroUI 内置的暗色模式系统
- 测试所有组件在深浅模式下的表现
- 必要时使用 `className="dark:..."` 补充

### 风险 5: 学习曲线和开发时间

**缓解措施**:
- 分阶段迁移，团队逐步熟悉 HeroUI API
- 参考官方文档和示例
- 预留充足的学习和调试时间

## Migration Plan

### 阶段 0: 准备工作

```bash
# 1. 安装依赖
npm install @nextui-org/react framer-motion

# 2. 创建主题文件
# 创建 src/theme.ts 配置 ChronoFlow 色板

# 3. 配置 App.tsx
# 添加 NextUIProvider 包裹
```

### 阶段 1: 原型验证 (AISettingsModal)

```bash
# 1. 重写 AISettingsModal.tsx
# 2. 测试所有功能 (provider 选择、输入、保存)
# 3. 验证深色模式
# 4. 确认无功能丢失
# 5. 提交 PR 评审
```

### 阶段 2: 基础组件替换

```bash
# 1. 全局搜索 Button 引用，替换为 HeroUI Button
# 2. 全局搜索 Badge 引用，替换为 HeroUI Chip
# 3. 删除 src/components/Button.tsx
# 4. 删除 src/components/Badge.tsx
# 5. 测试所有使用场景
# 6. 提交 PR
```

### 阶段 3: 中等复杂度组件

```bash
# 1. 重写 TaskList.tsx 任务卡片部分
# 2. 重写 GuideModal.tsx
# 3. 重写 AIInsights.tsx 和 AIProjectGenerator.tsx
# 4. 逐个测试组件功能
# 5. 提交 PR
```

### 阶段 4: 高复杂度组件 (可选)

```bash
# 1. 评估 TaskTimer 是否需要迁移
# 2. 如需迁移，保留分隔面板自定义实现
# 3. 重写 ProjectManager 和 FullscreenFocus
# 4. 完整回归测试
```

### 回滚策略

- 每个 Phase 独立分支，可单独回滚
- 保留旧组件代码直到下一 Phase 完成
- Git 历史保留所有中间状态

## Open Questions

1. **HeroUI Select 的 optgroup 支持**: 需要验证 HeroUI Select 是否支持类似原生 `<optgroup>` 的功能，用于 AI 模型选择器

2. **TaskTimer 分隔面板实现**: TaskTimer 的可调整大小分隔面板 HeroUI 无原生支持，是否保留现有实现或寻找替代方案？

3. **动画性能**: Framer Motion 在大量列表项中的性能表现如何？需要实际测试

4. **主题更新频率**: 如果 HeroUI 更新主题 API，我们扩展的主题配置是否需要维护？

## Component Mapping Reference

| 当前组件 | HeroUI 组件 | 复杂度 | 备注 |
|---------|------------|-------|------|
| Button | Button | 低 | variants 映射到 color/size props |
| Badge | Chip | 低 | 颜色映射到 color props |
| Input | Input | 低 | startContent/endContent 对应图标 |
| Select | Select | 中 | 需验证 optgroup 支持 |
| Modal | Modal | 低 | ModalContent/ModalBody/ModalFooter |
| Card (TaskList) | Card | 中 | 可能需要封装层 |
| Progress | Progress | 低 | API 基本一致 |
| Tooltip | Tooltip | 低 | 直接替换 |
| Accordion (Collapsible) | Accordion | 中 | 需要自定义 header 样式 |
| 图表 | Recharts | N/A | 保留，不替换 |
| 图标 | Lucide React | N/A | 保留，不替换 |
