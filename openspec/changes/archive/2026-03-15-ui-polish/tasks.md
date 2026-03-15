# UI Polish - FullscreenFocus HeroUI Migration - Implementation Tasks

## Phase 1: 准备工作

### 1.1 添加必要的导入
- [x] 在 `src/components/FullscreenFocus.tsx` 顶部添加 HeroUI Button 和 Chip 导入

**文件**: `src/components/FullscreenFocus.tsx`

**修改位置**: Line ~2 (import 区域)

**新增导入**:
```tsx
import { Button, Chip } from '@heroui/react';
```

**验收标准**:
- HeroUI Button 和 Chip 组件导入成功
- 无 TypeScript 类型错误

---

## Phase 2: 迁移标签 Chips

### 2.1 将标签 span 替换为 HeroUI Chip
- [x] 将标签从 span 元素替换为 Chip 组件
- [x] 配置 Chip 的 variant 和 color
- [x] 保持原有样式（bg-white/10、backdrop-blur-md、border）

**文件**: `src/components/FullscreenFocus.tsx`

**修改位置**: Line ~125-130

**原代码**:
```tsx
{(activeTask.tags || []).map(tag => (
  <span key={tag} className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
    {tag}
  </span>
))}
```

**修改为**:
```tsx
{(activeTask.tags || []).map(tag => (
  <Chip
    key={tag}
    color="default"
    variant="flat"
    className="bg-white/10 backdrop-blur-md border border-white/20"
  >
    {tag}
  </Chip>
))}
```

**验收标准**:
- 标签显示为 Chip 组件样式
- 半透明背景效果保持
- 深色模式样式正确

---

## Phase 3: 迁移操作按钮

### 3.1 迁移播放/暂停按钮（主操作）
- [x] 将原生 button 替换为 HeroUI Button
- [x] 配置 isIconOnly、size="lg"、color="success"
- [x] 保持圆形样式和阴影效果
- [x] 更新图标颜色（移除 fill-current）

**文件**: `src/components/FullscreenFocus.tsx`

**修改位置**: Line ~141-152

**原代码**:
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

**修改为**:
```tsx
<Button
  isIconOnly
  size="lg"
  color="success"
  variant="solid"
  className="w-20 h-20 rounded-full shadow-lg hover:shadow-xl min-w-unit-20 h-unit-20"
  onPress={() => onToggleStatus(activeTask.id)}
>
  {activeTask.status === TaskStatus.RUNNING ? (
     <Pause className="w-8 h-8" />
  ) : (
     <Play className="w-8 h-8 ml-1" />
  )}
</Button>
```

**验收标准**:
- 按钮显示为绿色（success）
- 圆形样式正确
- 悬停阴影效果正常
- 图标显示正确

---

### 3.2 迁移退出按钮（次要操作）
- [x] 将原生 button 替换为 HeroUI Button
- [x] 配置 isIconOnly、size="lg"、color="default"
- [x] 保持半透明背景效果

**文件**: `src/components/FullscreenFocus.tsx`

**修改位置**: Line ~154-160

**原代码**:
```tsx
<button
  onClick={onExit}
  className="group flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
>
  <X className="w-6 h-6" />
</button>
```

**修改为**:
```tsx
<Button
  isIconOnly
  size="lg"
  color="default"
  variant="flat"
  className="w-16 h-16 rounded-full backdrop-blur-md min-w-unit-16 h-unit-16"
  onPress={onExit}
>
  <X className="w-6 h-6" />
</Button>
```

**验收标准**:
- 按钮显示为默认样式
- 半透明背景效果保持
- 圆形样式正确

---

### 3.3 迁移背景图片按钮
- [x] 将原生 button 替换为 HeroUI Button
- [x] 配置 isIconOnly、size="sm"、color="default"

**文件**: `src/components/FullscreenFocus.tsx`

**修改位置**: Line ~166-172

**原代码**:
```tsx
<button
  onClick={() => fileInputRef.current?.click()}
  className="p-3 rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white backdrop-blur-md transition-all"
>
  <ImageIcon className="w-5 h-5" />
</button>
```

**修改为**:
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

**验收标准**:
- 按钮显示正确
- 点击可触发文件选择
- 图标显示正确

---

## Phase 4: 背景和样式优化

### 4.1 添加默认背景图片
- [x] 添加默认背景图片 URL
- [x] 移除渐变背景，使用图片作为默认背景
- [x] 调整叠加层透明度和模糊效果

**文件**: `src/components/FullscreenFocus.tsx`

**修改内容**:
```tsx
// 默认背景图片
const defaultBackground = 'https://maas-log-prod.cn-wlcb.ufileos.com/...';

// 背景层
<div
  className="absolute inset-0 z-0 bg-cover bg-center"
  style={{ backgroundImage: `url(${backgroundImage || defaultBackground})` }}
/>

// 叠加层调整
<div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-[2px]" />
```

**验收标准**:
- 默认显示抽象渐变背景
- 用户可上传自定义背景覆盖
- 叠加层让内容清晰可读

---

### 4.2 按钮和标签不透明样式
- [x] 播放/暂停按钮保持绿色不透明
- [x] 退出按钮改为白色不透明背景
- [x] 背景图片按钮改为白色不透明背景
- [x] 标签 chips 改为白色不透明背景
- [x] 日期时间卡片改为白色不透明背景

**文件**: `src/components/FullscreenFocus.tsx`

**修改内容**:
```tsx
// 退出按钮
<Button
  variant="solid"
  className="bg-white/90 hover:bg-white shadow-lg"
>
  <X className="text-neutral-900" />
</Button>

// 标签
<Chip
  variant="solid"
  className="bg-white/90 hover:bg-white border-0 shadow-md"
>
  {tag}
</Chip>

// 日期时间卡片
<div className="bg-white/90 hover:bg-white rounded-2xl text-neutral-900">
  <Calendar className="text-green-600" />
</div>
```

**验收标准**:
- 所有按钮和标签不透明
- 白色背景提升可读性
- Hover 效果正常

---

## Phase 5: 测试与验证

### 5.1 功能测试
- [x] 播放/暂停按钮正常工作
- [x] 退出按钮可关闭全屏模式
- [x] 背景图片上传功能正常
- [x] 所有按钮 hover 效果正常

**验收标准**:
- 所有交互功能正常工作
- 无控制台错误

---

### 5.2 样式测试
- [x] 全屏模式下按钮样式正确
- [x] 绿色主按钮（success）显示正确
- [x] 不透明按钮效果正确
- [x] 默认背景图片显示正常

**验收标准**:
- 视觉效果与设计一致
- 无样式错位

---

## 实施顺序建议

```
Step 1: 准备工作 (2 min)
└── Phase 1: 添加导入

Step 2: 迁移标签 (5 min)
└── Phase 2: Chips 迁移

Step 3: 迁移按钮 (20 min)
├── Phase 3.1: 播放/暂停按钮
├── Phase 3.2: 退出按钮
└── Phase 3.3: 背景图片按钮

Step 4: 测试 (10 min)
├── Phase 4.1: 功能测试
└── Phase 4.2: 样式测试
```

## 文件修改清单

| 文件 | 修改类型 | 新增行数 | 删除行数 |
|------|----------|----------|----------|
| `src/components/FullscreenFocus.tsx` | 重构 | ~15 | ~15 |
| **总计** | | **~15** | **~15** |

## 风险和注意事项

1. **Button 尺寸**：HeroUI Button 的默认尺寸可能与自定义尺寸不同，需要通过 className 调整
2. **圆形样式**：HeroUI 默认不支持圆形按钮，需要使用 `rounded-full` 类
3. **半透明背景**：使用 `variant="flat"` 配合自定义 className 实现
