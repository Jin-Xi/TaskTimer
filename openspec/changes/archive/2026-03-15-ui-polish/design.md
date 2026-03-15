# UI Polish - FullscreenFocus HeroUI Migration - Design

## Architecture Overview

FullscreenFocus 组件使用 HeroUI Button 和 Chip 组件替换原生按钮和标签。

## Component Structure

```
FullscreenFocus
├── Background Layer
├── Overlay (backdrop-blur)
├── Top Left: Date & Time Display
├── Center Content
│   ├── Tags (HeroUI Chips)
│   ├── Task Title
│   ├── Timer Display
│   └── Action Buttons
│       ├── Play/Pause Button (HeroUI Button, isIconOnly, large, success)
│       └── Exit Button (HeroUI Button, isIconOnly, default)
└── Bottom Right: Background Image Button (HeroUI Button, isIconOnly, default)
```

## Button Migration

### 1. Play/Pause Button (主操作按钮)

**Before:**
```tsx
<button
  onClick={() => onToggleStatus(activeTask.id)}
  className="group flex items-center justify-center w-20 h-20 rounded-full bg-white text-olive-500 hover:bg-green-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
>
  {activeTask.status === TaskStatus.RUNNING ? (
    <Pause className="w-8 h-8 fill-current" />
  ) : (
    <Play className="w-8 h-8 fill-current ml-1" />
  )}
</button>
```

**After:**
```tsx
import { Button } from '@heroui/react';

<Button
  isIconOnly
  size="lg"
  color="success"
  variant="solid"
  className="w-20 h-20 rounded-full shadow-lg hover:shadow-xl"
  onPress={() => onToggleStatus(activeTask.id)}
>
  {activeTask.status === TaskStatus.RUNNING ? (
    <Pause className="w-8 h-8" />
  ) : (
    <Play className="w-8 h-8 ml-1" />
  )}
</Button>
```

### 2. Exit Button (次要操作按钮)

**Before:**
```tsx
<button
  onClick={onExit}
  className="group flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
>
  <X className="w-6 h-6" />
</button>
```

**After:**
```tsx
<Button
  isIconOnly
  size="lg"
  color="default"
  variant="flat"
  className="w-16 h-16 rounded-full backdrop-blur-md"
  onPress={onExit}
>
  <X className="w-6 h-6" />
</Button>
```

### 3. Background Image Button

**Before:**
```tsx
<button
  onClick={() => fileInputRef.current?.click()}
  className="p-3 rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white backdrop-blur-md transition-all"
>
  <ImageIcon className="w-5 h-5" />
</button>
```

**After:**
```tsx
<Button
  isIconOnly
  size="sm"
  color="default"
  variant="flat"
  className="p-3 rounded-full backdrop-blur-md"
  onPress={() => fileInputRef.current?.click()}
>
  <ImageIcon className="w-5 h-5" />
</Button>
```

## Tag Chips Migration

**Before:**
```tsx
{(activeTask.tags || []).map(tag => (
  <span key={tag} className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
    {tag}
  </span>
))}
```

**After:**
```tsx
import { Chip } from '@heroui/react';

{(activeTask.tags || []).map(tag => (
  <Chip
    key={tag}
    color="default"
    variant="flat"
    className="bg-white/10 backdrop-blur-md border-white/20"
  >
    {tag}
  </Chip>
))}
```

## Color Mapping

| 原颜色 | HeroUI 颜色 | 用途 |
|--------|------------|------|
| text-olive-500 | success | 主操作按钮（播放/暂停） |
| text-terracotta-300 | danger | 退出操作（可选用） |
| bg-white/10 | default | 次要操作、标签 |

## Imports

需要新增的导入：

```tsx
import { Button, Chip } from '@heroui/react';
```

可以移除的导入（如果 Button 和 Chip 替换所有使用）：

无需移除，因为其他组件可能还在使用原生 button。

## 样式自定义

对于全屏模式，可能需要额外的 classNames 来保持视觉效果：

```tsx
<Button
  isIconOnly
  size="lg"
  color="success"
  variant="solid"
  className="w-20 h-20 rounded-full shadow-lg hover:shadow-xl min-w-unit-20 h-unit-20"
  onPress={...}
>
  ...
</Button>
```

## 视觉效果

### 全屏专注模式布局

```
┌─────────────────────────────────────────────────────────┐
│ 📅 2026年3月15日 星期六      🕐 14:30:25               │ (左上)
│                                                         │
│                    [标签1] [标签2]                       │
│                                                         │
│                  任务标题                               │ (居中)
│                                                         │
│              00:42:15                                  │
│                                                         │
│            [▶️]      [❌]                               │ (按钮)
│                                                         │
│                                            [🖼️]        │ (右下)
└─────────────────────────────────────────────────────────┘
```

## 文件修改

| 文件 | 修改类型 | 说明 |
|------|----------|------|
| `src/components/FullscreenFocus.tsx` | 重构 | 按钮/标签迁移到 HeroUI |
