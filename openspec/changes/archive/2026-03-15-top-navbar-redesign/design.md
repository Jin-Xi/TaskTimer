# Top Navigation Bar Redesign - Design

## Architecture Overview

使用 HeroUI Navbar 组件重构顶部导航栏，采用三栏布局：
- **左侧**：Logo + 系统名称
- **中间**：Tabs 导航
- **右侧**：状态指示器 + GitHub 链接
- **右边缘**：任务清单汉堡按钮（紧贴边框）

## Component Structure

```
Main Container
├── Navbar (HeroUI)
│   ├── NavbarBrand
│   │   ├── Logo (icon variant)
│   │   └── APP_NAME text
│   ├── NavbarContent (center, hidden on mobile)
│   │   └── Tabs
│   │       └── Tab (for each NAV_ITEM)
│   └── NavbarContent (end)
│       ├── Today's Completed Count ("今日完成: 3" + green checkmark)
│       └── GitHub Link
└── Task List Hamburger Button (absolute/fixed, right edge)
    └── Menu icon button
```

## Design Details

### Navbar 配置

| 属性 | 值 | 说明 |
|------|-----|------|
| maxWidth | full | 占满容器宽度 |
| isBordered | true | 显示底部边框 |

### 样式自定义

```tsx
classNames={{
  base: "bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-700",
  wrapper: "px-4",
}}
```

### Tabs 配置

| 属性 | 值 | 说明 |
|------|-----|------|
| variant | underlined | 下划线风格 |
| color | success | 绿色主题 |
| selectedKey | activeTab | 当前选中 Tab |
| onSelectionChange | handle tab switch | 带方向感知 |

### Tab 样式

```tsx
classNames={{
  base: "gap-6",
  tabList: "gap-6",
  cursor: "bg-green-400",
  tab: "px-0 py-2 h-auto",
  tabContent: "group-data-[selected=true]:text-green-500 font-semibold text-neutral-500 dark:text-neutral-400",
}}
```

### 响应式处理

- **桌面端 (sm+)**: 显示 Tabs 导航
- **移动端**: 隐藏 Tabs，使用 Drawer 组件访问导航

## 移除的元素

1. **左侧浮动汉堡按钮**：
   ```tsx
   // 移除
   <button className="fixed left-4 top-1/2 -translate-y-1/2 z-40...">
     <Menu />
   </button>
   ```

2. **右侧浮动任务按钮**：
   ```tsx
   // 移除
   <button className="fixed right-4 top-1/2 -translate-y-1/2 z-40...">
     <ListTodo />
   </button>
   ```

3. **旧 header**：
   ```tsx
   // 移除
   <header className="sticky top-0 ...">
     <Logo variant="horizontal" size={28} />
   </header>
   ```

## 新增的元素

### 今日完成数指示器

显示今日已完成的任务数量，实时统计并更新。

```tsx
<div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
  <span>今日完成: {todayCompletedCount}</span>
  <CheckCircle className="w-4 h-4 text-green-500" />
</div>
```

**实现说明**：
- 使用 `useEffect` 订阅 tasks 数据变化
- 过滤出今日完成的任务（status === 'COMPLETED' && 完成日期为今天）
- 实时更新计数
- 使用 CheckCircle 图标增强视觉效果

### GitHub 链接

```tsx
<a
  href="https://github.com/Jin-Xi/TaskTimer"
  target="_blank"
  rel="noopener noreferrer"
  className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
  aria-label="GitHub Repository"
>
  <Github className="w-5 h-5" />
</a>
```

### 任务清单汉堡按钮

使用熟悉的汉堡菜单图标，紧贴右侧边框，提升可发现性。

```tsx
<button
  onClick={handleOpenTaskList}
  className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-slate-600 bg-slate-50 dark:bg-slate-800 rounded-l-xl transition-all motion-press border border-slate-200 dark:border-slate-700 shadow-lg z-40"
  aria-label="打开任务清单"
  aria-expanded={isTaskListOpen}
>
  <Menu className="w-6 h-6" />
</button>
```

**样式说明**：
- 使用 Menu 图标（汉堡菜单），用户熟悉的交互模式
- 绝对定位，紧贴右侧边框（`right-0`）
- 垂直居中（`top-1/2 -translate-y-1/2`）
- 圆角仅在左侧（`rounded-l-xl`），形成"贴边"效果
- 与 Navbar 高度对齐
- 悬停和点击有视觉反馈

## Tab 切换逻辑保持

保持现有的方向感知动画逻辑：

```tsx
onSelectionChange={(key) => {
  const currentIndex = NAV_ITEMS.findIndex(nav => nav.id === activeTab);
  const newIndex = NAV_ITEMS.findIndex(nav => nav.id === key);
  setTabDirection(newIndex > currentIndex ? 1 : -1);
  setActiveTab(key as string);
}}
```

## Imports

需要新增的导入：

```tsx
import { Navbar, NavbarBrand, NavbarContent, Tabs, Tab } from '@heroui/react';
import { Github, CheckCircle, Menu } from 'lucide-react';
```

**注意**：不再需要 `NavbarItem` 和 `Button`，任务清单按钮使用原生 button 元素。

## 文件修改

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `src/App.tsx` | 重构 | Navbar 部分替换 |

## 视觉效果

### 桌面端
```
┌───────────────────────────────────────────────────────────────────────│
│ [Logo] ChronoFlow    任务  项目  规划  仪表盘  AI    今日完成: 3 ✓ [🔗]  ☰
└───────────────────────────────────────────────────────────────────────│
                                                                               ↑
                                                                    汉堡按钮紧贴右边缘
```

### 移动端
```
┌─────────────────────────────────────────────────────────│
│ [Logo] ChronoFlow                            今日完成: 3 ✓ [🔗]  ☰
└─────────────────────────────────────────────────────────│
```

**图例**：
- `☰` = 汉堡菜单按钮 (Menu 图标，紧贴右侧边框)
- `今日完成: 3` = 今日完成任务数
- `✓` = 绿色对勾图标 (CheckCircle)
- `[🔗]` = GitHub 链接
