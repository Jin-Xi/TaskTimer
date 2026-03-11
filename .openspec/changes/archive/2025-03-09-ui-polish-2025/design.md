# UI Polish 2025 - Design Document

## Design Principles

1. **一致性**：导航栏和任务清单栏使用相同的抽屉式交互模式
2. **响应式**：根据屏幕尺寸自适应抽屉宽度
3. **可访问性**：完整的键盘导航和屏幕阅读器支持
4. **渐进式**：保持现有布局结构，只优化细节

## Component Design

### 1. 抽屉式导航栏

#### 布局结构

```
关闭状态:
┌─────────────────────────────────────────────────────────────┐
│  [☰]  主内容区                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

打开状态:
┌──────┤ [遮罩层]  主内容区 (模糊)                            │
│      │ ↑ 点击遮罩或 ESC 关闭                                │
│ 导航 │                                                       │
│ 抽屉 │                                                       │
│ [×]  │                                                       │
└──────┴───────────────────────────────────────────────────────┘
```

#### 尺寸规范

| 屏幕尺寸 | 抽屉宽度 | 最大宽度 |
|----------|----------|----------|
| < 768px  | 80%      | 320px    |
| 768-1024px | 60%   | 400px    |
| > 1024px | 400px    | 400px    |

#### 样式规范

```css
/* 遮罩层 */
- 背景: bg-black/20
- 模糊: backdrop-blur-sm
- 层级: z-[60]
- 过渡: opacity 300ms

/* 抽屉内容 */
- 背景: bg-white dark:bg-slate-900
- 层级: z-[70]
- 阴影: shadow-2xl
- 过渡: cubic-bezier(0.32, 0.72, 0, 1) 500ms
- 边框: border-r border-neutral-200 dark:border-neutral-700
```

#### 交互行为

- 打开：点击汉堡菜单
- 关闭：点击遮罩层、点击关闭按钮、按 ESC 键
- 互斥：打开任务清单时自动关闭导航栏

### 2. 抽屉式任务清单栏

与导航栏采用相同的设计规范，确保交互一致性。

#### 状态管理

```typescript
// App.tsx
const [isNavOpen, setIsNavOpen] = useState(false);
const [isTaskListOpen, setIsTaskListOpen] = useState(false);

// 互斥逻辑
const handleOpenNav = () => {
  setIsNavOpen(true);
  setIsTaskListOpen(false);
};

const handleOpenTaskList = () => {
  setIsTaskListOpen(true);
  setIsNavOpen(false);
};
```

### 3. 计时器数字修复

#### 问题分析

当前使用 `text-[clamp(2rem,12vw,8rem)]` 导致：
- 小屏幕：2rem
- 中屏幕：12vw（可能过大）
- 大屏幕：8rem（可能溢出）

#### 解决方案

```css
/* 调整后的字体大小 */
text-[length:clamp(1.5rem,6vw,3.5rem)]
sm:text-[length:clamp(2rem,5vw,4rem)]
md:text-5xl
lg:text-6xl
xl:text-7xl

/* 防溢出保护 */
font-mono
tabular-nums
tracking-tighter
leading-none
max-w-full
overflow-hidden
```

### 4. 空格键快捷键

#### 实现逻辑

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // 只在没有活动输入框时生效
    if (document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.code === 'Space' && activeTask) {
      e.preventDefault();
      if (activeTask.status === TaskStatus.RUNNING ||
          activeTask.status === TaskStatus.BREAK) {
        onPause(activeTask.id);
      } else {
        onStart(activeTask.id);
      }
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [activeTask]);
```

#### 视觉反馈

按下空格键时显示简短提示：
```
┌─────────────────────────────────────────┐
│     ⏸ 已暂停                            │
│     ␣ 空格键: 继续                      │
└─────────────────────────────────────────┘
```

### 5. 全局计时状态指示器

#### 布局设计

```
┌─────────────────────────────────────────────────────────────┐
│  ● 正在专注: 深度学习 React    25:30   [空格暂停]      [最小化] │
└─────────────────────────────────────────────────────────────┘
     ↑ 固定在底部
```

#### 样式规范

```css
position: fixed
bottom: 0
left: 0
right: 0
height: h-14 (56px)
background: bg-white/90 dark:bg-slate-900/90
backdrop-blur-md
border-top: border-neutral-200 dark:border-neutral-700
z-index: z-[100]
```

#### 状态设计

| 计时状态 | 显示内容 |
|----------|----------|
| 无活动计时 | 不显示 |
| 运行中 | ● 任务名 + 已用时间 + [空格暂停] |
| 暂停中 | ⏸ 任务名 + 已用时间 + [空格继续] |
| 休息中 | ☕ 休息时间 + [空格结束] |

#### 最小化状态

```
最小化后:
┌─────────────────────────────────────────┐
│  ● 25:30                    [展开]     │
└─────────────────────────────────────────┘
```

### 6. 项目任务卡片优化

#### 当前问题

```
┌─────────────────────────────────────────┐
│ [RUNNING]  [编辑] [删除]                 │
│                                         │
│ 任务名称很长的任务名称很...              │
│ 这是一个任务的简介描述...  ← 需要移除   │
│                                         │
│ [学习] [工作]                            │
│                                         │
│ 🚩 3    ⏱ 45m                          │
└─────────────────────────────────────────┘
```

#### 优化后

```
┌─────────────────────────────────────────┐
│ [RUNNING]  [编辑] [删除]                 │
│                                         │
│ 任务名称很长的任务名称很... (hover 完整) │
│                                         │
│ [学习] [工作]              ⏱ 45m       │
│                              ↑ 更大     │
│                                         │
│ 依赖: 任务 A, 任务 B                     │
└─────────────────────────────────────────┘
```

#### 尺寸变更

```css
/* 当前 */
height: h-[260px]

/* 优化后 */
height: h-[300px]
```

#### 时长显示优化

```css
/* 当前 */
text-[8px] sm:text-[9px]

/* 优化后 */
text-xs sm:text-sm
font-mono
font-bold
```

#### Tooltip 实现

```tsx
import { Tooltip } from '@heroui/react';

<Tooltip content={task.title} showArrow>
  <h5 className="truncate max-w-[200px]">
    {task.title}
  </h5>
</Tooltip>
```

## 交互流程

### 打开导航栏

```
用户点击 [☰]
    ↓
检查任务清单是否打开
    ├─ 是 → 关闭任务清单
    └─ 否 → 继续
    ↓
设置导航栏打开状态
    ↓
禁用页面滚动
    ↓
设置焦点到导航栏
```

### 关闭抽屉

```
触发条件（任一）:
- 点击遮罩层
- 点击关闭按钮 [×]
- 按 ESC 键
- 点击另一个抽屉的打开按钮
    ↓
关闭抽屉
    ↓
恢复页面滚动
    ↓
焦点返回触发元素
```

### 空格键控制计时

```
用户按下空格键
    ↓
检查条件:
├─ 是否在输入框中？ → 忽略
├─ 是否有活动计时？ → 忽略
└─ 通过 → 继续
    ↓
阻止默认行为
    ↓
切换计时状态
    ↓
显示视觉反馈（Toast）
```

## 响应式设计

### 移动端 (< 768px)

- 导航栏：全屏遮罩 + 80% 宽度抽屉
- 任务清单：全屏遮罩 + 80% 宽度抽屉
- 全局指示器：始终显示，可最小化

### 平板 (768px - 1024px)

- 导航栏：60% 宽度抽屉
- 任务清单：60% 宽度抽屉
- 全局指示器：始终显示

### 桌面 (> 1024px)

- 导航栏：400px 固定宽度抽屉
- 任务清单：400px 固定宽度抽屉
- 全局指示器：始终显示

## 无障碍设计

### 键盘导航

- `Tab` / `Shift+Tab`：焦点移动
- `Enter` / `Space`：激活按钮
- `Escape`：关闭抽屉

### ARIA 标签

```tsx
{/* 抽屉容器 */}
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="nav-title"
  aria-hidden={!isOpen}
>

{/* 遮罩层 */}
<div
  role="presentation"
  aria-hidden="true"
>

{/* 汉堡菜单按钮 */}
<button
  aria-label="打开导航菜单"
  aria-expanded={isOpen}
  aria-controls="navigation-drawer"
>
```

### 焦点管理

```typescript
// 打开抽屉时
useEffect(() => {
  if (isOpen) {
    // 聚焦到第一个可交互元素
    drawerRef.current?.querySelector('button')?.focus();
    // 禁用背景滚动
    document.body.style.overflow = 'hidden';
  } else {
    // 恢复滚动
    document.body.style.overflow = '';
  }
}, [isOpen]);
```

## 设计令牌更新

```css
/* 抽屉宽度 */
--drawer-width-mobile: 80%;
--drawer-width-mobile-max: 320px;
--drawer-width-tablet: 60%;
--drawer-width-tablet-max: 400px;
--drawer-width-desktop: 400px;

/* 层级 */
--z-overlay: 60;
--z-drawer: 70;
--z-global-indicator: 100;

/* 过渡 */
--transition-drawer: cubic-bezier(0.32, 0.72, 0, 1) 500ms;
--transition-overlay: 300ms;

/* 计时器字体 */
--timer-font-size-min: 1.5rem;
--timer-font-size-responsive: 6vw;
--timer-font-size-max: 3.5rem;
```

## 动画规范

```css
/* 抽屉进入 */
@keyframes drawer-enter {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 抽屉退出 */
@keyframes drawer-exit {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

/* 遮罩淡入 */
@keyframes overlay-enter {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 遮罩淡出 */
@keyframes overlay-exit {
  from { opacity: 1; }
  to { opacity: 0; }
}
```
