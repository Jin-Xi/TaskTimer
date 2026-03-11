# UI Polish 2025 - Implementation Tasks

## Phase 1: 抽屉式导航栏改造

### 1.1 创建抽屉组件
- [x] 创建 `Drawer.tsx` 组件
- [x] 实现遮罩层 (Overlay)
- [x] 实现抽屉容器 (Drawer)
- [x] 添加动画效果
- [x] 添加关闭按钮

**文件**: `src/components/Drawer.tsx`

**验收标准**:
- 组件支持 children、isOpen、onClose props
- 遮罩层点击可关闭
- ESC 键可关闭
- 动画流畅（500ms cubic-bezier）

---

### 1.2 改造 App.tsx 导航栏
- [x] 移除固定侧边栏结构
- [x] 添加汉堡菜单按钮
- [x] 集成 Drawer 组件
- [x] 迁移导航内容到抽屉
- [x] 实现状态管理 (isNavOpen)

**文件**: `src/App.tsx`

**验收标准**:
- 点击汉堡菜单打开导航抽屉
- 导航项点击后自动关闭抽屉
- 切换标签页后抽屉保持关闭

---

## Phase 2: 抽屉式任务清单栏改造

### 2.1 任务清单抽屉集成
- [x] 添加汉堡菜单按钮（任务清单触发器）
- [x] 集成 Drawer 组件
- [x] 迁移 TaskList 到抽屉
- [x] 移除现有的折叠按钮逻辑

**文件**: `src/App.tsx`

**验收标准**:
- 点击任务清单汉堡菜单打开抽屉
- TaskList 在抽屉内正常显示
- 移动端和桌面端表现一致

---

### 2.2 双抽屉互斥逻辑
- [x] 实现打开一个抽屉时自动关闭另一个
- [x] 添加状态同步逻辑

**文件**: `src/App.tsx`

**验收标准**:
- 打开导航时任务清单自动关闭
- 打开任务清单时导航自动关闭

---

## Phase 3: 计时器数字修复

### 3.1 调整计时器字体样式
- [x] 修改 TaskTimer.tsx 中计时数字的 className
- [x] 调整 clamp() 范围
- [x] 添加防溢出保护

**文件**: `src/components/TaskTimer.tsx`

**修改位置**: Line ~195-205

**验收标准**:
- 时间显示在 1:23:45 格式下不溢出
- 时间显示在 123:45:67 格式下不溢出
- 等宽数字正确显示

---

## Phase 4: 空格键快捷键

### 4.1 实现全局键盘监听
- [x] 添加键盘事件监听器
- [x] 检查活动计时状态
- [x] 实现开始/暂停切换
- [x] 添加输入框检测（避免干扰）

**文件**: `src/App.tsx`

**验收标准**:
- 有活动计时器时，空格键控制开始/暂停
- 在输入框中输入时，空格键不触发
- Break 模式下空格键也可控制

---

### 4.2 添加视觉反馈
- [x] 创建 Toast 提示组件
- [x] 按空格键时显示状态变化提示

**文件**: `src/components/TimerToast.tsx`

**验收标准**:
- 暂停时显示 "⏸ 已暂停"
- 开始时显示 "▶️ 继续专注"
- 提示在 1.5 秒后自动消失

---

## Phase 5: 全局计时状态指示器

### 5.1 创建全局指示器组件
- [x] 创建 `GlobalTimerIndicator.tsx`
- [x] 实现固定底部布局
- [x] 显示当前任务名称
- [x] 显示计时时间
- [x] 添加最小化功能

**文件**: `src/components/GlobalTimerIndicator.tsx`

**验收标准**:
- 有活动计时器时显示在底部
- 无活动计时器时隐藏
- 可最小化/展开切换

---

### 5.2 集成到 App.tsx
- [x] 导入 GlobalTimerIndicator 组件
- [x] 传递必要的 props（活动任务、计时状态）
- [x] 确保 z-index 正确

**文件**: `src/App.tsx`

**验收标准**:
- 指示器始终显示在所有内容之上
- 切换标签页时指示器持续更新

---

## Phase 6: 项目任务卡片优化

### 6.1 移除任务简介显示
- [x] 删除 TaskCard 中的 description 显示

**文件**: `src/components/ProjectManager.tsx`

**修改位置**: Line ~438

**验收标准**:
- 卡片不显示任务简介
- 卡片高度调整后布局正常

---

### 6.2 增大卡片尺寸
- [x] 修改卡片高度从 260px 到 300px
- [x] 调整内部间距

**文件**: `src/components/ProjectManager.tsx`

**修改位置**: Line ~402

**验收标准**:
- 卡片高度为 300px
- 内容分布均匀

---

### 6.3 优化时长显示
- [x] 增大时长字体
- [x] 调整时长显示位置

**文件**: `src/components/ProjectManager.tsx`

**修改位置**: Line ~452

**验收标准**:
- 时长字体从 9px 增大到 14px
- 使用等宽字体
- 保持 "25m" 格式

---

### 6.4 添加智能截断 + Tooltip
- [x] 导入 HeroUI Tooltip 组件
- [x] 包装任务标题
- [x] 添加 truncate 样式

**文件**: `src/components/ProjectManager.tsx`

**修改位置**: Line ~437

**验收标准**:
- 长任务名自动截断
- hover 显示完整任务名
- Tooltip 样式与整体一致

---

## Phase 7: 无障碍支持

### 7.1 添加 ARIA 标签
- [x] 抽屉组件添加 role="dialog"
- [x] 添加 aria-modal 属性
- [x] 添加 aria-label 到所有按钮
- [x] 添加 aria-expanded 到汉堡菜单

**文件**: `src/components/Drawer.tsx`, `src/App.tsx`

**验收标准**:
- 屏幕阅读器正确识别抽屉
- 按钮状态正确宣布

---

### 7.2 焦点管理
- [x] 打开抽屉时聚焦到第一个元素
- [x] 关闭抽屉时返回触发元素
- [x] 添加焦点陷阱（抽屉内循环）

**文件**: `src/components/Drawer.tsx`

**验收标准**:
- Tab 键在抽屉内循环
- 关闭抽屉后焦点正确返回

---

## Phase 8: 样式统一和测试

### 8.1 移除任务清单多余边框
- [x] 简化 TaskList 容器边框
- [x] 优化任务卡片边框
- [x] 统一使用背景色区分层级

**文件**: `src/components/TaskList.tsx`

**验收标准**:
- 视觉层次清晰
- 无多层嵌套边框

---

### 8.2 响应式测试
- [x] 测试移动端布局 (< 768px)
- [x] 测试平板布局 (768px - 1024px)
- [x] 测试桌面布局 (> 1024px)

**验收标准**:
- 所有屏幕尺寸下抽屉宽度正确
- 动画流畅无卡顿

---

### 8.3 交叉浏览器测试
- [x] Chrome
- [x] Firefox
- [x] Safari
- [x] Edge

**验收标准**:
- 所有浏览器功能正常
- 动画表现一致

---

## Phase 9: 移除点阵背景（纯净界面）

### 9.1 移除 App.tsx 中的点阵背景类
- [x] 移除 main 容器的 `bg-dot-pattern` 类
- [x] 移除 main 容器的 `dark:bg-dot-pattern-dark` 类
- [x] 保留基础背景色

**文件**: `src/App.tsx`

**修改位置**: Line ~453

**验收标准**:
- 主容器无点阵背景
- 背景色为纯色（neutral-50 或对应深色背景）

---

### 9.2 清理 Tailwind 配置中的点阵定义
- [x] 从 `tailwind.config.js` 移除 `dot-pattern` 相关背景定义
- [x] 从 `tailwind.config.js` 移除 `organic-pattern` 相关背景定义

**文件**: `tailwind.config.js`

**修改位置**: Line ~197-202

**验收标准**:
- 配置文件无点阵相关配置
- 构建无警告或错误

---

### 9.3 清理 index.css 中的点阵样式
- [x] 移除 `.bg-dots` 样式定义
- [x] 移除 `.dark .bg-dots` 样式定义
- [x] 移除 `.bg-dot-pattern` 样式定义
- [x] 移除 `.dark .bg-dot-pattern` 样式定义

**文件**: `src/index.css`

**修改位置**: Line ~66-83

**验收标准**:
- CSS 文件无点阵相关样式
- 深色/浅色模式背景正常显示

---

## Phase 10: 卡片组件迁移到 HeroUI Card

### 10.1 TaskList 组件迁移到 HeroUI Card
- [x] 导入 HeroUI Card 组件
- [x] 将任务列表项包装在 Card 中
- [x] 使用 HeroUI 的 `isPressable` 属性实现 hover 效果
- [x] 调整 Card 的 `className` 以匹配现有样式
- [x] 移除自定义的 border/bg 样式，使用 Card 内置样式

**文件**: `src/components/TaskList.tsx`

**修改位置**: Line ~200-204 (任务卡片渲染)

**HeroUI Card 用法示例**:
```tsx
import { Card } from '@heroui/react';

<Card
  isPressable
  className="transition-all hover:scale-[1.01]"
  classNames={{
    base: "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700",
  }}
>
  {/* 原有卡片内容 */}
</Card>
```

**验收标准**:
- 卡片使用 HeroUI Card 组件
- 边框清晰可见（HeroUI 自动处理主题颜色）
- Hover 效果流畅
- 深色/浅色模式对比度良好

---

### 10.2 ProjectManager 任务卡片迁移到 HeroUI Card
- [x] 导入 HeroUI Card 组件
- [x] 将 WBS 任务卡片包装在 Card 中
- [x] 调整 Card 尺寸和圆角以匹配设计（rounded-[2rem]）
- [x] 使用 `isPressable` 实现上浮效果
- [x] 保留现有的颜色主题逻辑

**文件**: `src/components/ProjectManager.tsx`

**修改位置**: Line ~400-415 (TaskCard 组件)

**验收标准**:
- 卡片使用 HeroUI Card 组件
- 边框在深色/浅色模式下都清晰可见
- Hover 时 -translate-y-1 效果保留
- 主题色（绿色/赭石色等）正确应用

---

### 10.3 调整 HeroUI Card 样式变量
- [x] 在 Tailwind 配置中添加 HeroUI Card 自定义样式
- [x] 调整 `--card-border-radius` CSS 变量
- [x] 验证 z-index 层级正确

**文件**: `src/App.tsx` (HeroUIProvider 配置)

**验收标准**:
- Card 圆角匹配现有设计 (2rem)
- 阴影深度符合视觉层次
- 无样式冲突

---

## 实施顺序建议

```
Week 1:
├── Day 1: Phase 1 (抽屉组件 + 导航栏改造)
├── Day 2: Phase 2 (任务清单抽屉)
├── Day 3: Phase 3 (计时器修复) + Phase 4 (空格键)
└── Day 4: Phase 5 (全局指示器)

Week 2:
├── Day 1: Phase 6 (项目卡片优化)
├── Day 2: Phase 7 (无障碍支持)
└── Day 3-4: Phase 8 (样式统一和测试)
```

## 文件修改清单

| 文件 | 修改类型 | 新增行数估计 |
|------|----------|--------------|
| `src/components/Drawer.tsx` | 新增 | ~150 |
| `src/components/GlobalTimerIndicator.tsx` | 新增 | ~80 |
| `src/components/TimerToast.tsx` | 新增 | ~40 |
| `src/App.tsx` | 修改 | ~100 |
| `src/components/TaskTimer.tsx` | 修改 | ~5 |
| `src/components/TaskList.tsx` | 修改 | ~30 |
| `src/components/ProjectManager.tsx` | 修改 | ~40 |
| `tailwind.config.js` | 修改 | ~-5 (删除) |
| `src/index.css` | 修改 | ~-20 (删除) |
| **总计** | | **~420 行** |

## 风险和注意事项

1. **状态同步**: 确保抽屉状态与活动标签页正确同步
2. **事件监听清理**: 组件卸载时正确清理键盘监听器
3. **Z-index 冲突**: 确保全局指示器层级高于所有其他元素
4. **性能**: 避免在每次渲染时创建新的事件监听器
