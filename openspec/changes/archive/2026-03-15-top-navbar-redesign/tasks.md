# Top Navigation Bar Redesign - Implementation Tasks

## Phase 1: 准备工作

### 1.1 添加必要的导入
- [x] 在 `src/App.tsx` 顶部添加 HeroUI Navbar 相关导入
- [x] 添加 Github、CheckCircle、Menu 图标导入

**文件**: `src/App.tsx`

**修改位置**: Line ~2-4 (import 区域)

**新增导入**:
```tsx
import { Navbar, NavbarBrand, NavbarContent, Tabs, Tab } from '@heroui/react';
import { Github, CheckCircle, Menu } from 'lucide-react';
```

**注意**：不再需要 `NavbarItem` 和 `Button` 导入，汉堡按钮使用原生 button。

**验收标准**:
- HeroUI Navbar 组件导入成功
- Github 图标导入成功
- 无 TypeScript 类型错误

---

## Phase 2: 移除旧导航元素

### 2.1 移除左侧浮动汉堡按钮
- [x] 删除 fixed 定位的汉堡按钮
- [x] 移除相关 aria 属性

**文件**: `src/App.tsx`

**修改位置**: Line ~460-468

**删除代码**:
```tsx
<button
  onClick={handleOpenNav}
  className="fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3 ..."
  aria-label="打开导航菜单"
  aria-expanded={isNavOpen}
>
  <Menu className="w-6 h-6" />
</button>
```

**验收标准**:
- 左侧浮动按钮已移除
- 不再占用屏幕边缘空间

---

### 2.2 移除右侧浮动任务按钮
- [x] 删除 fixed 定位的任务清单按钮

**文件**: `src/App.tsx`

**修改位置**: Line ~470-478

**删除代码**:
```tsx
<button
  onClick={handleOpenTaskList}
  className="fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3 ..."
  aria-label="打开任务清单"
  aria-expanded={isTaskListOpen}
>
  <ListTodo className="w-6 h-6" />
</button>
```

**验收标准**:
- 右侧浮动按钮已移除

---

### 2.3 移除旧 header
- [x] 删除自定义 header 元素
- [x] 移除 sticky 定位的 Logo

**文件**: `src/App.tsx`

**修改位置**: Line ~480-485

**删除代码**:
```tsx
<header className="sticky top-0 left-0 right-0 flex items-center justify-center p-4 ...">
  <Logo variant="horizontal" size={28} />
</header>
```

**验收标准**:
- 旧 header 已移除
- Logo 将在新的 NavbarBrand 中显示

---

## Phase 3: 实现 HeroUI Navbar

### 3.1 创建 Navbar 基础结构
- [x] 添加 Navbar 组件
- [x] 配置 maxWidth 和 isBordered 属性
- [x] 设置自定义 classNames

**文件**: `src/App.tsx`

**修改位置**: Line ~460 (替换旧导航代码)

**新增代码**:
```tsx
<Navbar
  maxWidth="full"
  isBordered
  classNames={{
    base: "bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-700",
    wrapper: "px-4",
  }}
>
  {/* Navbar 内容将在后续步骤添加 */}
</Navbar>
```

**验收标准**:
- Navbar 显示在页面顶部
- 背景和边框样式正确
- 深色模式样式正常

---

### 3.2 实现 NavbarBrand（左侧）
- [x] 添加 NavbarBrand 组件
- [x] 显示 Logo (icon variant)
- [x] 显示 APP_NAME

**文件**: `src/App.tsx`

**新增代码**:
```tsx
<NavbarBrand className="gap-3">
  <Logo variant="icon" size={32} />
  <span className="font-bold text-xl text-neutral-900 dark:text-neutral-100">
    {APP_NAME}
  </span>
</NavbarBrand>
```

**验收标准**:
- Logo 和系统名称显示在左侧
- 字体大小和颜色正确
- 深色模式对比度良好

---

### 3.3 实现 Tabs 导航（中间）
- [x] 添加 NavbarContent (center)
- [x] 添加 HeroUI Tabs 组件
- [x] 配置 Tabs 样式和事件处理
- [x] 添加响应式隐藏 (hidden sm:flex)

**文件**: `src/App.tsx`

**新增代码**:
```tsx
<NavbarContent className="hidden sm:flex gap-4" justify="center">
  <Tabs
    selectedKey={activeTab}
    onSelectionChange={(key) => {
      const currentIndex = NAV_ITEMS.findIndex(nav => nav.id === activeTab);
      const newIndex = NAV_ITEMS.findIndex(nav => nav.id === key);
      setTabDirection(newIndex > currentIndex ? 1 : -1);
      setActiveTab(key as string);
    }}
    variant="underlined"
    color="success"
    classNames={{
      base: "gap-6",
      tabList: "gap-6",
      cursor: "bg-green-400",
      tab: "px-0 py-2 h-auto",
      tabContent: "group-data-[selected=true]:text-green-500 font-semibold text-neutral-500 dark:text-neutral-400",
    }}
  >
    {NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      return (
        <Tab
          key={item.id}
          title={
            <span className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span>{(t as any)[item.labelKey]}</span>
            </span>
          }
        />
      );
    })}
  </Tabs>
</NavbarContent>
```

**验收标准**:
- Tabs 显示在页面中间
- 每个 Tab 显示图标和文本
- 选中状态显示绿色下划线
- Tab 切换时方向感知正确
- 移动端隐藏 Tabs

---

### 3.4 实现任务清单汉堡按钮
- [x] 添加汉堡按钮（使用原生 button 元素）
- [x] 使用 Menu 图标（用户熟悉的汉堡菜单）
- [x] 绝对定位，紧贴右侧边框（right-0）
- [x] 垂直居中对齐（top-1/2 -translate-y-1/2）在主内容区域
- [x] 绑定 handleOpenTaskList 事件
- [x] 添加水滴状样式和 motion-press 动画类

**文件**: `src/App.tsx`

**修改位置**: 在 Navbar 组件之后，作为 main 的同级元素

**新增代码**:
```tsx
{/* Task List Hamburger Button - 水滴状紧贴右侧边框 */}
<button
  onClick={handleOpenTaskList}
  className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-l-full rounded-r-lg transition-all motion-press border-l border-t border-b border-slate-200 dark:border-slate-700 shadow-lg z-40 hover:pr-5"
  aria-label="打开任务清单"
  aria-expanded={isTaskListOpen}
>
  <Menu className="w-6 h-6" />
</button>
```

**验收标准**:
- 汉堡按钮紧贴右侧边框（right-0）
- 垂直居中于主内容区域（不是 Navbar 对齐）
- 使用 Menu 图标，用户易于识别
- 水滴状外观（左侧完全圆角，右侧微圆角）
- 右侧无边框，形成"贴边"效果
- Hover 时向右展开（hover:pr-5）
- 点击可打开任务清单 Drawer
- 深色模式样式正确

---

### 3.5 实现右侧内容区域（今日完成数和 GitHub）
- [x] 添加状态变量跟踪今日完成任务数
- [x] 实现 useEffect 订阅 tasks 数据变化
- [x] 过滤并计算今日完成的任务数量
- [x] 添加今日完成数显示组件
- [x] 添加 GitHub 链接（正确 URL）

**文件**: `src/App.tsx`

**状态变量**:
```tsx
const [todayCompletedCount, setTodayCompletedCount] = useState(0);
```

**数据订阅逻辑**:
```tsx
useEffect(() => {
  const unsubscribe = subscribeToTasks((tasks) => {
    const today = new Date().toDateString();
    const completedToday = tasks.filter(task =>
      task.status === 'COMPLETED' &&
      new Date(task.updatedAt || task.createdAt).toDateString() === today
    );
    setTodayCompletedCount(completedToday.length);
  });
  return unsubscribe;
}, []);
```

**新增代码**:
```tsx
<NavbarContent justify="end" className="gap-4">
  {/* 今日完成数 */}
  <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
    <span>今日完成: {todayCompletedCount}</span>
    <CheckCircle className="w-4 h-4 text-green-500" />
  </div>

  {/* GitHub 链接 */}
  <a
    href="https://github.com/Jin-Xi/TaskTimer"
    target="_blank"
    rel="noopener noreferrer"
    className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
    aria-label="GitHub Repository"
  >
    <Github className="w-5 h-5" />
  </a>
</NavbarContent>
```

**验收标准**:
- 今日完成数实时更新
- 完成任务后数字自动增加
- GitHub 链接跳转到 https://github.com/Jin-Xi/TaskTimer
- CheckCircle 图标正确显示
- hover 效果正常
- 深色模式样式正确

---

### 3.6 布局优化 - 计时卡片垂直居中
- [x] 移除旧的 spacer div（补偿 GlobalTimerIndicator 的占位元素）
- [x] 简化 tasks tab 的嵌套容器结构
- [x] 将 GlobalTimerIndicator 移入 section 内部（在文档流中）
- [x] 使用 flexbox 垂直居中计时卡片
- [x] 确保布局自动适应 GlobalTimerIndicator 的显示/隐藏

**文件**: `src/App.tsx`

**修改位置**: Main content section 结构

**修改说明**:

1. **移除 spacer div**:
```tsx
// REMOVED:
<div className="shrink-0 transition-all duration-300 ease-out" style={{ height: activeFocusTask ? '56px' : '0px' }} />
```

2. **简化 tasks tab 容器**:
```tsx
// BEFORE:
<div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-4 md:px-10">
  <div className="flex-1 flex flex-col items-center justify-center">
    <div className="w-full max-w-[1600px] py-6 md:py-12">
      <TaskTimer ... />
    </div>
  </div>
</div>

// AFTER:
<div className="flex-1 flex items-center justify-center p-4 md:px-10">
  <TaskTimer ... />
</div>
```

3. **移动 GlobalTimerIndicator**:
```tsx
// FROM: Outside section (after closing </section> tag)
// TO: Inside section (after </AnimatePresence>)

<section className="flex-1 flex flex-col overflow-hidden">
  <AnimatePresence mode="wait" initial={false}>
    {/* Tab content */}
  </AnimatePresence>

  {/* Global Timer Indicator - now in document flow */}
  {activeFocusTask && (
    <GlobalTimerIndicator ... />
  )}
</section>
```

**验收标准**:
- 计时卡片在主内容区域垂直居中
- 布局自动适应 GlobalTimerIndicator 的显示/隐藏
- 无需手动计算 spacer 高度
- Flexbox 自动计算可用空间

---

## Phase 4: 测试与验证

### 4.1 功能测试
- [x] Tab 切换功能正常
- [x] 方向感知动画正常
- [x] 汉堡按钮可打开任务清单
- [x] 汉堡按钮紧贴右侧边框且垂直居中
- [x] 今日完成数实时统计正确
- [x] 完成任务后数字自动增加
- [x] GitHub 链接跳转到正确页面
- [x] 响应式布局正常
- [x] 计时卡片垂直居中显示
- [x] GlobalTimerIndicator 显示时卡片自动调整位置

**验收标准**:
- 所有交互功能正常工作
- 今日完成数统计准确
- 计时卡片始终居中显示
- 无控制台错误

---

### 4.2 样式测试
- [ ] 浅色模式样式正确
- [ ] 深色模式样式正确
- [ ] 移动端布局正常
- [ ] 桌面端布局正常

**验收标准**:
- 所有视图下样式一致
- 无视觉错位

---

### 4.3 跨浏览器测试
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**验收标准**:
- 所有浏览器功能正常
- 样式一致

---

## 实施顺序建议

```
Step 1: 准备工作 (5 min)
└── Phase 1: 添加导入

Step 2: 清理旧代码 (10 min)
├── Phase 2.1: 移除左侧汉堡按钮
├── Phase 2.2: 移除右侧任务按钮
└── Phase 2.3: 移除旧 header

Step 3: 实现新 Navbar (25 min)
├── Phase 3.1: Navbar 基础结构
├── Phase 3.2: NavbarBrand
├── Phase 3.3: Tabs 导航
├── Phase 3.4: 任务清单按钮 ⬅️ 新增
└── Phase 3.5: 状态指示器和 GitHub

Step 4: 测试 (15 min)
├── Phase 4.1: 功能测试
├── Phase 4.2: 样式测试
└── Phase 4.3: 跨浏览器测试
```

## 文件修改清单

| 文件 | 修改类型 | 新增行数 | 删除行数 |
|------|----------|----------|----------|
| `src/App.tsx` | 重构 | ~80 | ~15 |
| **总计** | | **~80** | **~15** |

## 风险和注意事项

1. **响应式处理**: 移动端需要保留其他导航方式（如 Drawer）
2. **状态管理**: 确保 activeTab 和 tabDirection 状态正常更新
3. **翻译支持**: Tab 文本使用翻译系统
4. **HeroUI 版本**: 确认 HeroUI v2 API 正确使用
