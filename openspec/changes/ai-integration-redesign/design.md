# AI Integration Redesign - Design

## Architecture Overview

### Current Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  当前: 5 个标签                                                  │
├─────────────────────────────────────────────────────────────────┤
│  [专注] [规划] [项目] [统计] [教练]                              │
│    │      │      │      │      │                               │
│    │      └── AI-planner (独立)                                │
│    │                   │                                       │
│    └────────────────────┴── ai-insights (独立)                  │
└─────────────────────────────────────────────────────────────────┘
```

### New Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  新设计: 3 个标签                                                │
├─────────────────────────────────────────────────────────────────┤
│  [专注] [项目] [统计]                                            │
│    │      │      │                                              │
│    │      └── 整合 AI 规划                                      │
│    │             │                                              │
│    └─────────────┴── 整合日历 + AI 分析                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Design

### 1. ProjectManager AI Integration

#### Zero State Component

```tsx
interface ProjectZeroStateProps {
  onManualAdd: () => void;
  onAIGenerate: () => void;
  language: Language;
}

// Location: 在项目详情视图，无任务流时显示
```

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    ┌─────────────────┐                          │
│                    │                 │                          │
│                    │   暂无任务流    │                          │
│                    │                 │                          │
│                    └─────────────────┘                          │
│                                                                  │
│         ┌──────────────────────┐  ┌──────────────────────┐     │
│         │                      │  │                      │     │
│         │   ✏️ 手工添加任务流  │  │   ✨ AI 生成任务流   │     │
│         │                      │  │                      │     │
│         └──────────────────────┘  └──────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Split Button Component (有任务流时)

```tsx
interface SplitButtonProps {
  onManualAdd: () => void;
  onAIGenerate: () => void;
  language: Language;
}

// Desktop: Hover 展开
// Mobile: Click 展开
```

**States:**

```
Collapsed:           Hover/Click Active:
┌──────────┐         ┌──────────────────────┐
│  + 添加  │    ─▶   │ ┌──────────┐ ┌──────┐ │
└──────────┘         │ │AI 智能生成│ │手工添加│ │
                     │ └──────────┘ └──────┘ │
                     └──────────────────────┘
```

---

### 2. AI Planning Modal (Conversational)

```tsx
interface AIPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  mode: 'zero-state' | 'continuation';
  existingTasks?: Task[];
  onConfirm: (tasks: TaskPreview[]) => void;
  language: Language;
}
```

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  AI 项目规划                                      [×]           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ┌───────────────────────────────────────────────────┐   │    │
│  │ │ 对话历史区 (flex-1, overflow-auto)               │   │    │
│  │ │                                                   │   │    │
│  │ │ ┌─────────────────────────────────────────────┐  │   │    │
│  │ │ │ AI: 请描述你的项目目标...                   │  │   │    │
│  │ │ └─────────────────────────────────────────────┘  │   │    │
│  │ │                                                   │   │    │
│  │ │ ┌─────────────────────────────────────────────┐  │   │    │
│  │ │ │ 用户: 写一个博客网站                        │  │   │    │
│  │ │ └─────────────────────────────────────────────┘  │   │    │
│  │ │                                                   │   │    │
│  │ │ ┌─────────────────────────────────────────────┐  │   │    │
│  │ │ │ AI: 我为你规划了以下任务:                   │  │   │    │
│  │ │ │ ┌───────────────────────────────────┐      │  │   │    │
│  │ │ │ │ T1: 需求分析                     │      │  │   │    │
│  │ │ │ │ T2: 技术选型                     │      │  │   │    │
│  │ │ │ │ T3: 页面设计                     │      │  │   │    │
│  │ │ │ │ T4: 开发实现                     │      │  │   │    │
│  │ │ │ └───────────────────────────────────┘      │  │   │    │
│  │ │ └─────────────────────────────────────────────┘  │   │    │
│  │ └───────────────────────────────────────────────────┘   │    │
│  │                                                         │    │
│  │ ┌─────────────────────────────────────────────────┐    │    │
│  │ │ 输入框                            [发送]         │    │    │
│  │ └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [🔄 重新生成]  [✓ 确认添加]  [✕ 取消]                          │
└─────────────────────────────────────────────────────────────────┘
```

**Message Component:**

```tsx
interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  taskPreview?: TaskPreview[];
  timestamp: number;
}
```

---

### 3. Calendar View Component

```tsx
interface CalendarViewProps {
  year: number;
  month: number;
  tasks: Task[];
  projects: Project[];
  onMonthChange: (year: number, month: number) => void;
  onExportICS: () => void;
  language: Language;
}
```

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  2026年3月                          [导出 ICS] [◀] 2026年3月 [▶] │
├─────────────────────────────────────────────────────────────────┤
│  ┌──┬──┬──┬──┬──┬──┬──┐                                       │
│  │日│一│二│三│四│五│六│                                       │
│  ├──┼──┼──┼──┼──┼──┼──┤                                       │
│  │  │  │  │  │  │  │  │                                       │
│  │  │  │  │ 1│ 2│ 3│ 4│  ...  (每日单元格)                     │
│  │  │  │  │  │  │  │  │                                       │
│  ├──┼──┼──┼──┼──┼──┼──┤                                       │
│  │  │11│12│13│14│15│16│                                       │
│  │  │  │  │  │  │  │  │                                       │
│  └──┴──┴──┴──┴──┴──┴──┘                                       │
│                                                                  │
│  月度汇总                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 项目A    ████████████░░░░░░░░░░  12h  ███ 35%            │   │
│  │ 项目B    ██████░░░░░░░░░░░░░░░░░   8h  ██  23%            │   │
│  │ 项目C    ████░░░░░░░░░░░░░░░░░░░   5h  █   15%           │   │
│  │ 无分类   ████████████████░░░░░░░░   9h  ██  27%           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Day Cell Component:**

```tsx
interface DayCellProps {
  date: Date;
  tasks: Task[];
  projects: Project[];
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
}

// 项目显示规则:
// - 按时长降序排列
// - 前 3 个完全显示 (opacity: 1)
// - 其余半透明 (opacity: 0.3)
// - 溢出显示 "+N 更多"
```

---

## Data Models

### AI Conversation Types

```typescript
// 新增到 src/types.ts

export enum AIMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: number;
  taskPreview?: TaskPreview[];
}

export interface TaskPreview {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  tag?: string;
  parentIds: string[];
  isNew?: boolean;
}

export interface AIPlanningSession {
  id: string;
  projectId: string;
  mode: 'zero-state' | 'continuation';
  messages: AIMessage[];
  currentTasks: TaskPreview[];
  createdAt: number;
  updatedAt: number;
}
```

### ICS Export Types

```typescript
interface ICSEvent {
  uid: string;
  startDate: Date;
  endDate: Date;
  summary: string;
  description: string;
  location?: string;
}

interface ICSExportOptions {
  productName: string;
  timeZone: string;
  fileName: string;
}
```

---

## AI Prompt Design

### Zero-State Prompt Template

```
你是一个专业的项目规划顾问，为 ChronoFlow 应用生成任务分解结构（WBS）。

## 项目信息
- 项目名称：{projectName}
- 项目描述：{projectDescription}
- 用户目标：{userGoal}
- 额外上下文：{context}

## 任务分解规则
1. 创建 3-7 个主要任务，形成完整的工作流
2. 任务之间应该有前置依赖关系
3. 为每个任务估算合理的时间（分钟）
4. 为任务建议合适的标签
5. 为每个任务提供简短的执行说明

## 输出格式 (JSON)
{
  "text": "回复文本",
  "tasks": [...]
}

## 输出语言
{language}
```

### Continuation Prompt Template

```
你是一个专业的项目规划顾问，帮助用户延续和扩展现有的项目任务流。

## 项目信息
- 项目名称：{projectName}
- 项目描述：{projectDescription}

## 现有任务流
{tasksContext}

## 当前终止节点
{terminalNodes}

## 用户指令
{userInstruction}

## 任务延续规则
1. 保持现有任务的命名风格和结构
2. 新生成的任务应该依赖现有的终止节点
3. 生成 2-5 个后续任务
4. 确保整个任务流能够达到可完成的终点
5. 基于已用时间，合理估算后续任务时长

## 输出格式 (JSON)
{
  "text": "回复文本",
  "tasks": [...]
}

## 输出语言
{language}
```

---

## File Structure

### New Files

```
src/
├── components/
│   ├── AIPlanningModal.tsx          # AI 多轮对话 Modal
│   ├── CalendarView.tsx             # 月度日历视图
│   ├── ProjectZeroState.tsx         # 项目零状态 UI
│   └── SplitActionButton.tsx        # 分割按钮组件
├── utils/
│   ├── icsGenerator.ts              # ICS 文件生成
│   └── calendarUtils.ts             # 日历工具函数
└── types.ts                         # 添加新类型定义
```

### Modified Files

```
src/
├── constants.ts                      # 更新 NAV_ITEMS
├── App.tsx                          # 移除 AI 标签路由
├── components/
│   ├── ProjectManager.tsx           # 整合 AI 功能
│   └── Stats.tsx                    # 替换为日历视图
├── services/
│   └── aiService.ts                 # 添加多轮对话函数
└── locales/
    └── translations.ts              # 更新翻译
```

### Deleted Files

```
src/components/
├── AIProjectGenerator.tsx           # 功能整合到 ProjectManager
└── AIInsights.tsx                   # 功能整合到 CalendarView
```

---

## Interaction Flows

### Zero-State AI Planning Flow

```
用户进入项目详情
    │
    ▼
检测到无任务流
    │
    ▼
显示零状态 UI
    │
    ├── 点击"手工添加" ──▶ 打开添加节点 Modal
    │
    └── 点击"AI 生成" ──▶ 打开 AI 规划 Modal
                            │
                            ▼
                        多轮对话
                            │
                            ├── 用户输入目标
                            ├── AI 生成任务
                            ├── 用户要求调整
                            ├── AI 更新任务
                            └── ...
                            │
                            ▼
                        用户确认
                            │
                            ▼
                        添加任务到项目
```

### Continuation AI Planning Flow

```
用户查看项目详情
    │
    ▼
Hover/Click "添加" 按钮
    │
    ▼
展开选项
    │
    ├── 点击"手工添加" ──▶ 打开添加节点 Modal
    │
    └── 点击"AI 智能生成" ──▶ 打开 AI 规划 Modal
                                    │
                                    ▼
                                传入现有任务上下文
                                    │
                                    ▼
                                多轮对话
                                    │
                                    ▼
                                用户确认
                                    │
                                    ▼
                            添加任务到项目流末尾
```

---

## State Management

### AI Modal State

```typescript
interface AIPlanningModalState {
  isOpen: boolean;
  session: AIPlanningSession | null;
  isLoading: boolean;
  error: string | null;
  inputMessage: string;
}
```

### Calendar View State

```typescript
interface CalendarViewState {
  year: number;
  month: number;
  selectedDate: Date | null;
  isExporting: boolean;
}
```

---

## Responsive Design

### Desktop (≥768px)

- 日历: 7 列完整显示
- 分割按钮: Hover 展开
- 对话 Modal: 宽度 600px

### Mobile (<768px)

- 日历: 可横向滚动或精简显示
- 分割按钮: Click 展开
- 对话 Modal: 全屏或宽度 90%
