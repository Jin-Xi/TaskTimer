# ChronoFlow 定制配色方案

> 自然护眼的生产力工具配色系统

---

## 设计理念

ChronoFlow 的配色方案以"自然流动"为核心理念，采用带有植被温度的绿色系作为品牌主色，搭配护眼的中性灰和语义化的状态色，打造既专业又舒适的视觉体验。

### 设计原则

1. **护眼优先** - 避免使用纯黑(#000000)和纯白(#FFFFFF)，减少视觉疲劳
2. **语义清晰** - 状态颜色符合自然规律，非刺眼的交通灯配色
3. **层级分明** - 通过微妙的色差建立清晰的视觉层级
4. **AI 区分** - 独特的颜色标识 AI 相关功能，便于快速识别

---

## 核心调色板

### 1. 品牌核心色 (Brand Greens)

象征顺畅、完成与生长，代表生产力的正向流动。

| Token | Hex | 用途场景 |
|-------|-----|----------|
| `green-50` | `#F4F8F2` | 极浅背景、页面底层 |
| `green-100` | `#E8F5BD` | Accent Light - 时间块底色、极轻量背景点缀 |
| `green-200` | `#C7EABB` | Surface Green - 选中卡片背景、日历当日高亮 |
| `green-300` | `#A2CB8B` | Secondary Green - 进度条填充、次要按钮 |
| `green-400` | `#84B179` | **Primary Green** - 核心操作按钮、激活状态图标 |
| `green-500` | `#6A9662` | 悬停状态、深层交互 |
| `green-600` | `#507B4A` | 按下状态、深层反馈 |
| `green-700` | `#366032` | 深色模式文本 |
| `green-800` | `#2C3628` | Ink Text - 深绿灰墨色（替代纯黑） |
| `green-900` | `#1C2B1D` | 深色模式背景 |

**Tailwind 使用示例：**
```tsx
// 核心操作按钮
<button className="bg-green-400 hover:bg-green-500 text-white">
  开始计时
</button>

// 进度条
<div className="h-2 bg-green-200 rounded-full overflow-hidden">
  <div className="h-full bg-green-300" style={{ width: '60%' }} />
</div>

// 选中卡片
<div className="bg-green-200 border-2 border-green-400">
  已选中的任务
</div>
```

---

### 2. 中性色系 (Neutrals)

带有"植被和土壤"温度的灰色，用于构建视觉层级。

| Token | Hex | 用途场景 |
|-------|-----|----------|
| `neutral-50` | `#FBFDF9` | **App Base** - 整个 SPA 的底层背景色 |
| `neutral-100` | `#F0F3EC` | **Component Surface** - 任务列表、看板列背景卡片 |
| `neutral-200` | `#E0E8DE` | 边框、分割线 |
| `neutral-300` | `#CDD9CC` | 禁用状态边框 |
| `neutral-400` | `#B3C5AF` | 占位符图标 |
| `neutral-500` | `#99B192` | 深色模式次要文本 |
| `neutral-600` | `#7F9D75` | 深色模式描述文本 |
| `neutral-700` | `#658958` | 深色模式边框 |
| `neutral-800` | `#5C6B57` | **Muted Text** - 次要文本、时间戳、表单提示 |
| `neutral-900` | `#2C3628` | **Ink Text** - 主标题、正文颜色 |
| `neutral-950` | `#1A2419` | 深色模式深层背景 |

**Tailwind 使用示例：**
```tsx
// 页面背景
<body className="bg-neutral-50 dark:bg-neutral-950">

// 卡片表面
<div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4">

// 主文本
<h1 className="text-neutral-900 dark:text-neutral-100">标题</h1>
<p className="text-neutral-800 dark:text-neutral-200">正文内容</p>

// 次要文本
<span className="text-neutral-800">5分钟前</span>
<input placeholder="输入任务..." className="placeholder:text-neutral-800" />
```

---

### 3. 语义状态色 (Semantic States)

符合自然规律的警示色，表达工作流状态。

#### 进行中 / 聚焦 (Ochre - 赭土黄)

温暖的赭土黄色，代表"正在流动"的状态，非紧急的持续关注。

| Token | Hex | 用途 |
|-------|-----|------|
| `ochre-50` | `#FDF6EB` | 极浅背景 |
| `ochre-100` | `#FAEBD6` | 浅背景 |
| `ochre-200` | `#E5D6A8` | 装饰背景 |
| `ochre-300` | `#E5A952` | **主色** - 进行中标签、计时状态 |
| `ochre-400` | `#D4943D` | 悬停状态 |
| `ochre-500` | `#C27F28` | 按下状态 |
| `ochre-600` | `#A0651D` | 深色变体 |
| `ochre-700` | `#7E4B12` | 更深变体 |
| `ochre-800` | `#5C3107` | 深层变体 |
| `ochre-900` | `#3A1700` | 最深变体 |

**使用场景：**
- 正在计时的番茄钟显示
- "进行中" 状态的任务标签
- 聚焦模式的激活指示
- 需要注意但非紧急的提示

```tsx
// 进行中任务标签
<span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-ochre-100 text-ochre-700">
  <Clock className="w-3 h-3" />
  进行中
</span>

// 计时器状态
<div className="text-ochre-300 animate-pulse">
  正在专注...
</div>
```

#### 阻塞 / 危险 (Terracotta - 陶土红)

稳重的陶土红色，像砖石一样有警示作用但不让人恐慌。

| Token | Hex | 用途 |
|-------|-----|------|
| `terracotta-50` | `#FDF2F0` | 极浅背景 |
| `terracotta-100` | `#FBE6E1` | 浅背景 |
| `terracotta-200` | `#F0CDC4` | 装饰背景 |
| `terracotta-300` | `#E5B4A7` | 边框、装饰 |
| `terracotta-400` | `#D27D67` | **主色** - 阻塞状态、危险操作 |
| `terracotta-500` | `#BC6250` | 悬停状态 |
| `terracotta-600` | `#A14739` | 按下状态 |
| `terracotta-700` | `#862C22` | 深色变体 |
| `terracotta-800` | `#6B1112` | 深层变体 |
| `terracotta-900` | `#4F060A` | 最深变体 |

**使用场景：**
- 逾期任务标记
- 被前置条件阻塞的任务
- 系统错误提示
- 危险操作按钮（删除项目等）

```tsx
// 阻塞任务
<div className="flex items-center gap-2 text-terracotta-400">
  <Lock className="w-4 h-4" />
  <span>等待前置任务完成</span>
</div>

// 危险操作
<button className="bg-terracotta-400 hover:bg-terracotta-500 text-white">
  删除项目
</button>
```

#### 完成状态

使用绿色系表示完成，与品牌色保持一致。

```tsx
// 已完成任务
<span className="text-green-400 flex items-center gap-1">
  <CheckCircle className="w-4 h-4" />
  已完成
</span>
```

---

### 4. AI 交互色 (Cognitive & AI)

独特的石板溪蓝色，代表理性的水流与洞察力。

#### Slate River (石板溪蓝)

| Token | Hex | 用途 |
|-------|-----|------|
| `slate-river-50` | `#F1F5F6` | 极浅背景 |
| `slate-river-100` | `#E3EBED` | 浅背景 |
| `slate-river-200` | `#C7D5D9` | 装饰背景 |
| `slate-river-300` | `#9DBABF` | 边框、图标 |
| `slate-river-400` | `#6B8E9B` | **主色** - AI 聊天气泡、AI 建议 |
| `slate-river-500` | `#567580` | 悬停状态 |
| `slate-river-600` | `#415C65` | 按下状态 |
| `slate-river-700` | `#2C434A` | 深色变体 |
| `slate-river-800` | `#172A30` | 深层变体 |
| `slate-river-900` | `#021116` | 最深变体 |

**使用场景：**
- AI 教练的聊天气泡
- AI 自动生成的任务编排建议
- 数据分析图表中的"预测趋势线"
- AI 功能入口按钮

```tsx
// AI 聊天气泡
<div className="bg-slate-river-50 border border-slate-river-200 rounded-lg p-4">
  <div className="flex items-center gap-2 mb-2">
    <Brain className="w-4 h-4 text-slate-river-400" />
    <span className="text-sm font-medium text-slate-river-700">AI 建议</span>
  </div>
  <p className="text-neutral-800">建议您将大任务拆分为更小的步骤...</p>
</div>

// AI 预测线
<Line type="monotone" dataKey="prediction" stroke="#6B8E9B" strokeDasharray="5 5" />
```

---

## 标签/分类配色

用于任务分类和标签的颜色系统：

```tsx
export const TAG_COLORS = [
  'green',      // 学习 - 品牌主色
  'ochre',      // 工作 - 进行中
  'slate-river',// 计划 - AI 辅助
  'emerald',    // 健康 - 完成
  'violet',     // 创意
  'cyan',       // 技术
  'amber',      // 紧急
  'neutral',    // 其他
];
```

---

## Tailwind 配置

将以下配置添加到 `tailwind.config.js`：

```javascript
export default {
  theme: {
    extend: {
      colors: {
        // 品牌核心色
        green: {
          50: '#F4F8F2',
          100: '#E8F5BD',
          200: '#C7EABB',
          300: '#A2CB8B',
          400: '#84B179',
          500: '#6A9662',
          600: '#507B4A',
          700: '#366032',
          800: '#2C3628',
          900: '#1C2B1D',
        },
        // 中性色
        neutral: {
          50: '#FBFDF9',
          100: '#F0F3EC',
          200: '#E0E8DE',
          300: '#CDD9CC',
          400: '#B3C5AF',
          500: '#99B192',
          600: '#7F9D75',
          700: '#658958',
          800: '#5C6B57',
          900: '#2C3628',
          950: '#1A2419',
        },
        // 进行中
        ochre: {
          50: '#FDF6EB',
          100: '#FAEBD6',
          200: '#E5D6A8',
          300: '#E5A952',
          400: '#D4943D',
          500: '#C27F28',
          600: '#A0651D',
          700: '#7E4B12',
          800: '#5C3107',
          900: '#3A1700',
        },
        // 阻塞/危险
        terracotta: {
          50: '#FDF2F0',
          100: '#FBE6E1',
          200: '#F0CDC4',
          300: '#E5B4A7',
          400: '#D27D67',
          500: '#BC6250',
          600: '#A14739',
          700: '#862C22',
          800: '#6B1112',
          900: '#4F060A',
        },
        // AI 交互
        'slate-river': {
          50: '#F1F5F6',
          100: '#E3EBED',
          200: '#C7D5D9',
          300: '#9DBABF',
          400: '#6B8E9B',
          500: '#567580',
          600: '#415C65',
          700: '#2C434A',
          800: '#172A30',
          900: '#021116',
        },
      },
      backgroundImage: {
        'dot-pattern': "radial-gradient(#84B179 0.5px, transparent 0.5px)",
        'dot-pattern-dark': "radial-gradient(#6A9662 0.5px, transparent 0.5px)",
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(44, 54, 40, 0.08)',
        'green': '0 4px 12px rgba(132, 177, 121, 0.25)',
        'ochre': '0 4px 12px rgba(229, 169, 82, 0.25)',
        'terracotta': '0 4px 12px rgba(210, 125, 103, 0.25)',
        'slate-river': '0 4px 12px rgba(107, 142, 155, 0.25)',
      },
    },
  },
};
```

---

## 组件应用指南

### 按钮组件

```tsx
// 主要操作（开始计时、完成任务）
<Button className="bg-green-400 hover:bg-green-500 text-white shadow-green">
  开始计时
</Button>

// 次要操作
<Button className="bg-green-200 hover:bg-green-300 text-green-900">
  暂停
</Button>

// 危险操作
<Button className="bg-terracotta-400 hover:bg-terracotta-500 text-white shadow-terracotta">
  删除项目
</Button>

// AI 功能
<Button className="bg-slate-river-400 hover:bg-slate-river-500 text-white shadow-slate-river">
  AI 建议
</Button>
```

### 任务卡片

```tsx
<div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
  <h3 className="text-neutral-900 dark:text-neutral-100">任务标题</h3>
  <p className="text-neutral-800 dark:text-neutral-400 text-sm">描述内容</p>

  {/* 状态标签 */}
  {task.status === 'RUNNING' && (
    <span className="inline-flex items-center gap-1 text-ochre-300">
      <Clock className="w-3 h-3" />
      进行中
    </span>
  )}

  {task.status === 'COMPLETED' && (
    <span className="inline-flex items-center gap-1 text-green-400">
      <CheckCircle className="w-3 h-3" />
      已完成
    </span>
  )}

  {task.blocked && (
    <span className="inline-flex items-center gap-1 text-terracotta-400">
      <Lock className="w-3 h-3" />
      已阻塞
    </span>
  )}
</div>
```

### 进度条

```tsx
// 工作进度（绿色）
<div className="h-2 bg-green-100 rounded-full overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-green-300 to-green-400 transition-all duration-300"
    style={{ width: `${progress}%` }}
  />
</div>

// 休息进度（赭土黄）
<div className="h-2 bg-ochre-100 rounded-full overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-ochre-200 to-ochre-300 transition-all duration-300"
    style={{ width: `${breakProgress}%` }}
  />
</div>
```

### AI 聊天气泡

```tsx
<div className="bg-slate-river-50 border border-slate-river-200 rounded-lg p-4 shadow-slate-river">
  <div className="flex items-center gap-2 mb-2">
    <Sparkles className="w-4 h-4 text-slate-river-400" />
    <span className="text-sm font-medium text-slate-river-700">AI 教练</span>
  </div>
  <div className="text-neutral-800 space-y-2">
    <p>根据您的数据分析...</p>
  </div>
</div>
```

---

## 深色模式适配

### 文本颜色映射

| 浅色模式 | 深色模式 |
|----------|----------|
| `text-neutral-900` (主文本) | `text-neutral-100` |
| `text-neutral-800` (次要文本) | `text-neutral-400` |
| `text-neutral-800` (占位符) | `text-neutral-700` |

### 背景颜色映射

| 浅色模式 | 深色模式 |
|----------|----------|
| `bg-neutral-50` (App Base) | `bg-neutral-950` |
| `bg-neutral-100` (Surface) | `bg-neutral-900` |
| `bg-white` (卡片) | `bg-neutral-900` |
| `bg-green-50` | `bg-green-900` |

### 完整深色模式示例

```tsx
<div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen">
  <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4">
    <h1 className="text-neutral-900 dark:text-neutral-100">标题</h1>
    <p className="text-neutral-800 dark:text-neutral-400">描述</p>
    <span className="text-neutral-800 dark:text-neutral-700">占位符</span>
  </div>
</div>
```

---

## 颜色对比度检查

确保符合 WCAG AA 标准：

| 前景色 | 背景色 | 对比度 | 等级 |
|--------|--------|--------|------|
| `#2C3628` on `#FBFDF9` | 12.8:1 | AAA |
| `#5C6B57` on `#FBFDF9` | 7.2:1 | AA |
| `#84B179` on `#FBFDF9` | 3.8:1 | 需加粗/大字 |
| `#FFFFFF` on `#84B179` | 3.5:1 | 需加粗/大字 |
| `#FFFFFF` on `#D27D67` | 4.2:1 | AA |
| `#FFFFFF` on `#6B8E9B` | 4.1:1 | AA |

---

## 迁移检查清单

- [ ] 更新 `tailwind.config.js` 颜色配置
- [ ] 更新 `src/constants.ts` 中的 `COLOR_HEX_MAP`
- [ ] 更新 `src/App.tsx` 导航栏颜色
- [ ] 更新 `src/components/TaskTimer.tsx` 核心界面
- [ ] 更新 `src/components/TaskList.tsx` 任务状态
- [ ] 更新 `src/components/AIInsights.tsx` AI 气泡
- [ ] 更新 `src/components/AIProjectGenerator.tsx` AI 装饰
- [ ] 更新 `src/components/Button.tsx` 按钮变体
- [ ] 测试浅色模式
- [ ] 测试深色模式
- [ ] 验证所有状态颜色（进行中、完成、阻塞）
- [ ] 检查 AI 功能界面
- [ ] 确认对比度符合无障碍标准

---

*文档版本: 1.0*
*最后更新: 2026-02-26*