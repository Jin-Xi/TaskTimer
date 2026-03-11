# Motion Polish 2025 - 实施任务

## Phase 1: 基础设施搭建

### 1.1 创建动画配置模块
- [x] 创建 `src/animations/springs.ts` 文件
- [x] 定义预配置的 spring 常量（snappy, smooth, bouncy）
- [x] 定义动画时长常量（fast, medium, slow）
- [x] 添加类型导出

**验收标准**:
- `springs.ts` 导出 snappy, smooth, bouncy 配置对象
- 配置对象包含 type, stiffness, damping 属性
- 可在项目中导入使用

---

### 1.2 创建动画变体配置
- [x] 创建 `src/animations/variants.ts` 文件
- [x] 定义页面切换变体（pageVariants）
- [x] 定义列表项变体（listItemVariants）
- [x] 定义模态框变体（modalVariants）

**验收标准**:
- `variants.ts` 导出通用动画变体
- 变体包含 initial, animate, exit 状态
- 支持方向感知的页面切换

---

### 1.3 创建动画组件目录结构
- [x] 创建 `src/animations/components/` 目录
- [x] 创建组件索引文件 `src/animations/index.ts`

**验收标准**:
- 目录结构完整
- index.ts 正确导出所有动画组件

---

## Phase 2: Tab 切换动画

### 2.1 创建 AnimatedPage 组件
- [x] 创建 `src/animations/components/AnimatedPage.tsx`
- [x] 实现 AnimatePresence 包装器
- [x] 添加页面切换动画（淡入淡出 + 滑动）
- [x] 支持方向感知（左进右出 vs 右进左出）
- [x] 添加 mode="wait" 防止内容重叠

**文件**: `src/animations/components/AnimatedPage.tsx`

**验收标准**:
- 组件接受 `children` 和 `direction` props
- 使用 AnimatePresence 实现切换动画
- 动画持续时间约 300ms
- 页面切换时有滑动效果

---

### 2.2 集成 AnimatedPage 到 App.tsx
- [x] 修改 `src/App.tsx` 的 Tab 切换逻辑
- [x] 用 AnimatedPage 包装每个 Tab 内容
- [x] 移除条件渲染的直接使用，改为 key-based 渲染
- [x] 添加 Tab 方向状态管理

**文件**: `src/App.tsx`

**修改位置**: Line ~476-498 (Tab 内容渲染区域)

**验收标准**:
- Tab 切换时有平滑的淡入淡出动画
- 内容不会同时显示（AnimatePresence mode="wait"）
- 方向正确（从任务切到项目与项目切到任务方向相反）

---

## Phase 3: 列表交错动画

### 3.1 创建 StaggeredList 组件
- [x] 创建 `src/animations/components/StaggeredList.tsx`
- [x] 实现子元素交错动画
- [x] 支持自定义延迟时间
- [x] 支持禁用交错动画（用于大列表）

**文件**: `src/animations/components/StaggeredList.tsx`

**验收标准**:
- 组件接受 `children` 和 `staggerDelay` props
- 每个子元素延迟启动动画
- 可通过 `disabled` prop 禁用交错效果

---

### 3.2 集成到 TaskList.tsx
- [x] 修改任务列表渲染逻辑
- [x] 用 StaggeredList 包装任务卡片列表
- [x] 设置适当的延迟时间（30ms）

**文件**: `src/components/TaskList.tsx`

**验收标准**:
- 任务列表项依次出现
- 每项延迟 30ms
- 新任务添加时有动画

---

### 3.3 集成到 ProjectManager.tsx
- [x] 修改项目任务卡片渲染逻辑
- [x] 用 StaggeredList 包装 WBS 卡片列表
- [x] 根据卡片数量动态决定是否启用交错动画

**文件**: `src/components/ProjectManager.tsx`

**验收标准**:
- WBS 卡片依次出现
- 超过 50 个卡片时禁用交错动画
- 新卡片添加时有动画

---

## Phase 3.5: 抽屉导航动画

### 3.5.1 改进 Drawer 组件动画
- [x] 用 Framer Motion 替换 CSS transition
- [x] 添加 AnimatePresence 支持
- [x] 实现方向感知的滑入/滑出动画
- [x] 添加 spring 物理效果（stiffness: 300, damping: 30）
- [x] 支持 reduced-motion 偏好

**文件**: `src/components/Drawer.tsx`

**验收标准**:
- 抽屉从屏幕边缘流畅滑入
- 关闭时流畅滑出
- 背景遮罩层淡入淡出
- 使用 spring 物理效果
- 尊重系统的 reduced-motion 设置

---

## Phase 4: 按钮反馈动画

### 4.1 创建 MotionButton 组件
- [x] 创建 `src/animations/components/MotionButton.tsx`
- [x] 实现 whileTap 缩小效果（scale: 0.95）
- [x] 实现 whileHover 放大效果（scale: 1.02）
- [x] 支持与 HeroUI Button 兼容

**文件**: `src/animations/components/MotionButton.tsx`

**验收标准**:
- 按下时缩小到 95%
- 悬停时放大到 102%
- 释放时平滑弹回
- 使用 spring 物理效果

---

### 4.2 添加全局按钮动画配置
- [x] 在常用按钮上添加 whileTap 属性
- [x] 优先级：主要操作按钮（开始、完成、添加）
- [x] 次要按钮可选添加

**文件**:
- `src/components/TaskTimer.tsx`
- `src/components/TaskList.tsx`
- `src/components/ProjectManager.tsx`

**验收标准**:
- 主要操作按钮有点击反馈动画
- 动画不影响按钮功能
- 视觉反馈明显但不突兀

---

## Phase 5: 性能优化与可访问性

### 5.1 实现 prefers-reduced-motion 支持
- [x] 创建 `src/animations/utils.ts` 工具文件
- [x] 实现 `prefersReducedMotion()` 检测函数
- [x] 根据检测结果动态调整动画参数

**文件**: `src/animations/utils.ts`

**验收标准**:
- 检测系统动画偏好设置
- 返回布尔值表示是否应减少动画
- 可在所有动画组件中使用

---

### 5.2 为所有动画组件添加无障碍支持
- [x] AnimatedPage 支持 reduced-motion
- [x] StaggeredList 支持禁用交错
- [x] MotionButton 支持禁用动画

**验收标准**:
- 系统启用 reduced-motion 时动画禁用或极简化
- 功能不受动画状态影响
- 无 A11y 警告

---

### 5.3 添加大列表性能优化
- [x] StaggeredList 添加阈值检测
- [x] 超过 100 项时自动禁用交错动画
- [x] 仅对可见区域应用动画

**验收标准**:
- 大列表性能不受影响
- FPS 保持 60+
- 动画组件有性能监控

---

## Phase 5.5: 布局优化 - 按钮位置与卡片居中

### 5.5.1 汉堡按钮垂直居中
- [x] 将汉堡按钮从 header 的 flex 布局中移出
- [x] 使用 absolute/fixed 定位，垂直居中在左边缘
- [x] 调整 header 布局为居中对齐
- [x] 添加过渡动画效果

**文件**: `src/App.tsx`

**验收标准**:
- 汉堡按钮位于页面左边缘垂直居中位置
- 使用 `top-1/2 -translate-y-1/2` 实现垂直居中
- z-index 确保不被内容遮挡
- 按钮有平滑的悬停/点击反馈动画

---

### 5.5.2 计时器卡片视觉居中
- [x] 在计时器容器顶部添加补偿 spacer
- [x] spacer 高度与底部任务条高度同步（56px）
- [x] 添加平滑过渡动画
- [x] 确保任务条显示/隐藏时卡片位置平滑变化

**文件**: `src/App.tsx`

**实现方式**:
```tsx
{/* 顶部补偿 - 当有底部任务条时 */}
<div className="shrink-0 transition-all duration-300"
     style={{ height: activeFocusTask ? '56px' : '0px' }} />
```

**验收标准**:
- 计时器卡片在有任务条时视觉上保持居中
- spacer 高度与 GlobalTimerIndicator 高度一致（56px）
- 任务条显示/隐藏时有平滑的过渡动画
- 不影响滚动行为

---

### 5.5.3 任务按钮位置调整与动画优化
- [x] 将任务按钮从 header 移出，改为 fixed 定位
- [x] 垂直居中在右边缘，与汉堡按钮对称
- [x] 两个按钮移除 hover 缩放效果（改用 motion-press）
- [x] 保持一致的阴影效果（shadow-lg）

**文件**: `src/App.tsx`

**修改内容**:
```tsx
// 任务按钮：从 header 内移出
// 修改前: className="absolute right-4 ..."
// 修改后: className="fixed right-4 top-1/2 -translate-y-1/2 z-40 ..."

// 两个按钮动画：
// 修改前: className="... motion-animate"
// 修改后: className="... motion-press"
```

**验收标准**:
- 任务按钮与汉堡按钮视觉对称（都垂直居中在边缘）
- hover 时无缩放效果（位置不变）
- 点击时有按压反馈（scale 0.95）
- 两个按钮使用相同的 shadow 样式

---

## Phase 5.6: 画布模型布局 - 解决所有标签页的重叠问题

### 5.6.1 修改 GlobalTimerIndicator 为文档流布局
- [x] 移除 `fixed bottom-0 left-0 right-0` 定位
- [x] 改为文档流布局，使用 `shrink-0` 保持固定高度
- [x] 保持现有样式和功能不变

**文件**: `src/components/GlobalTimerIndicator.tsx`

**修改前**:
```tsx
<div className="fixed bottom-0 left-0 right-0 h-14 ...">
```

**修改后**:
```tsx
<div className="shrink-0 h-14 ...">
```

**验收标准**:
- GlobalTimerIndicator 不再使用 fixed 定位
- 高度固定为 56px（h-14）
- 保持原有的视觉效果和交互功能
- 进入文档流，让父容器自动计算可用空间

---

### 5.6.2 重构 App.tsx 主布局为画布模型
- [x] 移除 tasks 标签页的顶部补偿 spacer（不再需要）
- [x] 重构主布局结构：Header (shrink-0) + Canvas (flex-1) + Footer (shrink-0, 条件)
- [x] 确保 GlobalTimerIndicator 位于主 flex 容器底部
- [x] 验证所有标签页的内容都不会被 footer 覆盖

**文件**: `src/App.tsx`

**布局结构变更**:
```tsx
<main className="flex-1 flex flex-col h-screen">
  {/* Header - 固定高度 */}
  <header className="shrink-0 h-16 ...">...</header>

  {/* Canvas - 占据剩余空间 */}
  <div className="flex-1 flex flex-col min-h-0">
    <AnimatePresence mode="wait" initial={false}>
      {/* 各标签页内容 - 自动适配可用空间 */}
    </AnimatePresence>
  </div>

  {/* Footer - 条件渲染，进入文档流 */}
  {activeFocusTask && (
    <GlobalTimerIndicator ... />
  )}
</main>
```

**验收标准**:
- 移除 tasks 标签页的顶部补偿 spacer 代码
- GlobalTimerIndicator 在主 flex 容器底部，非 fixed 定位
- Canvas 区域自动计算高度（100vh - header - footer）
- 所有标签页（tasks, ai-planner, projects, dashboard, ai-insights）内容都不被覆盖
- 计时器卡片在所有情况下都保持真正居中
- Footer 显示/隐藏时，Canvas 区域平滑过渡

---

### 5.6.3 验证所有标签页布局正确性
- [x] 检查 tasks 标签页 - 计时器卡片居中
- [x] 检查 ai-planner 标签页 - 内容不被覆盖
- [x] 检查 projects 标签页 - 底部内容不被覆盖
- [x] 检查 dashboard 标签页 - 底部内容不被覆盖
- [x] 检查 ai-insights 标签页 - 底部内容不被覆盖

**验收标准**:
- 所有标签页在有/无 footer 时都正常显示
- 底部内容不会被 GlobalTimerIndicator 覆盖
- Footer 显示/隐藏时内容区域平滑过渡
- 各标签页滚动行为正常

---

## Phase 6: 测试与调优

### 6.1 跨浏览器动画测试
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**验收标准**:
- 所有浏览器动画效果一致
- 性能表现良好
- 无视觉错误

---

### 6.2 性能测试
- [ ] 测试 50 个任务的列表渲染性能
- [ ] 测试 100 个任务的列表渲染性能
- [ ] 验证 FPS 保持 60+

**验收标准**:
- 大列表无卡顿
- 帧率稳定
- 无内存泄漏

---

### 6.3 动画参数微调
- [ ] 根据测试反馈调整 spring 参数
- [ ] 调整延迟时间
- [ ] 优化动画曲线

**验收标准**:
- 动画感觉自然流畅
- 无过度动画
- 用户反馈积极

---

## 实施顺序建议

```
Week 1: 基础 + 核心
├── Day 1: Phase 1 (基础设施搭建)
├── Day 2: Phase 2 (Tab 切换动画) ← 最大视觉提升
└── Day 3: Phase 3 (列表交错动画) + Phase 3.5 (抽屉动画)

Week 2: 完善 + 优化
├── Day 1: Phase 4 (按钮反馈动画)
├── Day 2: Phase 5 (性能与可访问性)
└── Day 3: Phase 6 (测试与调优)
```

## 文件修改清单

| 文件 | 类型 | 新增行数估计 |
|------|------|--------------|
| `src/animations/springs.ts` | 新增 | ~30 |
| `src/animations/variants.ts` | 新增 | ~50 |
| `src/animations/components/AnimatedPage.tsx` | 新增 | ~60 |
| `src/animations/components/StaggeredList.tsx` | 新增 | ~50 |
| `src/animations/components/MotionButton.tsx` | 新增 | ~40 |
| `src/animations/utils.ts` | 新增 | ~20 |
| `src/animations/index.ts` | 新增 | ~10 |
| `src/App.tsx` | 修改 | ~30 |
| `src/components/TaskList.tsx` | 修改 | ~20 |
| `src/components/ProjectManager.tsx` | 修改 | ~20 |
| `src/components/TaskTimer.tsx` | 修改 | ~15 |
| `src/components/Drawer.tsx` | 修改 | ~40 |
| `src/index.css` | 修改 | ~50 |
| **总计** | | **~485 行** |

## 风险和注意事项

1. **性能**: 大列表需要谨慎使用动画
2. **兼容性**: 确保 prefers-reduced-motion 正确工作
3. **HeroUI 冲突**: 动画组件不应破坏 HeroUI 功能
4. **调试**: 使用 framer-motion devtools 调试动画
5. **过度动画**: 避免让应用感觉"华而不实"
