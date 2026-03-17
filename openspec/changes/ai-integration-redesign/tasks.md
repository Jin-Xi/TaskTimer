# AI Integration Redesign - Implementation Tasks

## Phase 1: 准备工作和导航清理

### 1.1 更新类型定义
- [x] 在 `src/types.ts` 中添加 AI 相关类型
  - `AIMessageRole` enum
  - `AIMessage` interface
  - `TaskPreview` interface
  - `AIPlanningSession` interface
  - `ICSEvent` interface
  - `ICSExportOptions` interface

**文件**: `src/types.ts`

**新增内容**:
```typescript
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

export interface ICSEvent {
  uid: string;
  startDate: Date;
  endDate: Date;
  summary: string;
  description: string;
  location?: string;
}

export interface ICSExportOptions {
  productName: string;
  timeZone: string;
  fileName: string;
}
```

**验收标准**:
- TypeScript 编译无错误
- 类型定义正确

---

### 1.2 更新导航配置
- [x] 在 `src/constants.ts` 中更新 `NAV_ITEMS`
- [x] 移除 `ai-planner` 和 `ai-insights` 导航项

**文件**: `src/constants.ts`

**原代码**:
```typescript
export const NAV_ITEMS = [
  { id: 'tasks', labelKey: 'tasks', icon: ListTodo },
  { id: 'ai-planner', labelKey: 'aiPlanner', icon: BrainCircuit },
  { id: 'projects', labelKey: 'projects', icon: GitBranchPlus },
  { id: 'dashboard', labelKey: 'analytics', icon: ChartColumn },
  { id: 'ai-insights', labelKey: 'aiInsights', icon: Zap },
];
```

**修改为**:
```typescript
export const NAV_ITEMS = [
  { id: 'tasks', labelKey: 'tasks', icon: ListTodo },
  { id: 'projects', labelKey: 'projects', icon: GitBranchPlus },
  { id: 'dashboard', labelKey: 'analytics', icon: ChartColumn },
];
```

**验收标准**:
- 导航栏只显示 3 个标签

---

### 1.3 移除 App.tsx 中的 AI 标签路由
- [x] 移除 `ai-planner` 和 `ai-insights` 相关的组件导入
- [x] 移除对应的渲染逻辑

**文件**: `src/App.tsx`

**移除导入**:
```typescript
- import { AIInsights } from './components/AIInsights';
- import { AIProjectGenerator } from './components/AIProjectGenerator';
```

**移除渲染逻辑**:
在 Tabs 渲染部分，移除 `ai-planner` 和 `ai-insights` 的 case

**验收标准**:
- 应用正常启动
- 只显示 3 个标签的内容

---

## Phase 2: AI 规划整合到 ProjectManager

### 2.1 创建 ProjectZeroState 组件
- [x] 创建 `src/components/ProjectZeroState.tsx`
- [x] 实现双按钮 UI（手工添加、AI 生成）

**文件**: `src/components/ProjectZeroState.tsx`

**组件结构**:
```tsx
interface ProjectZeroStateProps {
  onManualAdd: () => void;
  onAIGenerate: () => void;
  language: Language;
}

export const ProjectZeroState: React.FC<ProjectZeroStateProps> = ({
  onManualAdd,
  onAIGenerate,
  language
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-center mb-8">
        <p className="text-neutral-400 text-lg">暂无任务流</p>
      </div>
      <div className="flex gap-4">
        <Button onClick={onManualAdd} variant="bordered">
          ✏️ {language === 'zh-TW' ? '手工添加任务流' : '手工添加任务流'}
        </Button>
        <Button onClick={onAIGenerate} color="primary">
          ✨ {language === 'zh-TW' ? 'AI 生成任务流' : 'AI 生成任务流'}
        </Button>
      </div>
    </div>
  );
};
```

**验收标准**:
- 组件正确显示两个按钮
- 点击按钮触发对应回调

---

### 2.2 创建 SplitActionButton 组件
- [x] 创建 `src/components/SplitActionButton.tsx`
- [x] 实现 Desktop Hover 展开
- [x] 实现 Mobile Click 展开

**文件**: `src/components/SplitActionButton.tsx`

**组件结构**:
```tsx
interface SplitActionButtonProps {
  onManualAdd: () => void;
  onAIGenerate: () => void;
  language: Language;
}

export const SplitActionButton: React.FC<SplitActionButtonProps> = ({
  onManualAdd,
  onAIGenerate,
  language
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="relative">
      <Button
        onClick={isMobile ? toggleExpanded : undefined}
        onMouseEnter={!isMobile ? () => setIsExpanded(true) : undefined}
        onMouseLeave={!isMobile ? () => setIsExpanded(false) : undefined}
      >
        + {language === 'zh-TW' ? '添加' : '添加'}
      </Button>

      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 flex flex-col gap-2 bg-white rounded-xl shadow-xl p-2 z-50">
          <Button onClick={onAIGenerate} size="sm">
            ✨ {language === 'zh-TW' ? 'AI 智能生成' : 'AI 智能生成'}
          </Button>
          <Button onClick={onManualAdd} size="sm" variant="bordered">
            ✏️ {language === 'zh-TW' ? '手工添加' : '手工添加'}
          </Button>
        </div>
      )}
    </div>
  );
};
```

**验收标准**:
- Desktop: Hover 正确展开选项
- Mobile: Click 正确展开/收起选项
- 点击选项触发对应回调

---

### 2.3 更新 ProjectManager 整合零状态和分割按钮
- [x] 在 ProjectManager 中检测零状态
- [x] 零状态时显示 ProjectZeroState
- [x] 有任务时显示 SplitActionButton

**文件**: `src/components/ProjectManager.tsx`

**修改内容**:

1. 添加状态管理:
```tsx
const [showAIPlanning, setShowAIPlanning] = useState(false);
```

2. 检测零状态:
```tsx
const projectTasks = tasks.filter(t => t.projectId === project.id);
const isZeroState = projectTasks.length === 0;
```

3. 条件渲染:
```tsx
{isZeroState ? (
  <ProjectZeroState
    onManualAdd={() => setIsAddingRoot(true)}
    onAIGenerate={() => setShowAIPlanning(true)}
    language={language}
  />
) : (
  <SplitActionButton
    onManualAdd={() => setIsAddingRoot(true)}
    onAIGenerate={() => setShowAIPlanning(true)}
    language={language}
  />
)}
```

**验收标准**:
- 零状态正确显示双按钮
- 有任务时正确显示分割按钮

---

## Phase 3: AI 多轮对话实现

### 3.1 创建 AIPlanningModal 组件
- [x] 创建 `src/components/AIPlanningModal.tsx`
- [x] 实现对话历史显示
- [x] 实现输入框和发送按钮
- [x] 实现任务预览卡片

**文件**: `src/components/AIPlanningModal.tsx`

**组件结构**:
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

export const AIPlanningModal: React.FC<AIPlanningModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  mode,
  existingTasks = [],
  onConfirm,
  language
}) => {
  const [session, setSession] = useState<AIPlanningSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化会话
  useEffect(() => {
    if (isOpen && !session) {
      const newSession: AIPlanningSession = {
        id: generateUUID(),
        projectId,
        mode,
        messages: [],
        currentTasks: existingTasks.map(t => ({...t})),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setSession(newSession);

      // 如果是零状态，发送欢迎消息
      if (mode === 'zero-state') {
        handleSendInitialMessage(newSession);
      } else {
        handleSendContinuationMessage(newSession);
      }
    }
  }, [isOpen, session]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !session || isLoading) return;

    const userMessage: AIMessage = {
      id: generateUUID(),
      role: AIMessageRole.USER,
      content: inputMessage,
      timestamp: Date.now()
    };

    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage],
      updatedAt: Date.now()
    };

    setSession(updatedSession);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await continuePlanningConversation(
        updatedSession,
        inputMessage,
        getAiConfig()
      );

      setSession({
        ...updatedSession,
        messages: [...updatedSession.messages, aiResponse],
        currentTasks: aiResponse.taskPreview || updatedSession.currentTasks,
        updatedAt: Date.now()
      });
    } catch (err: any) {
      setError(err.message || language === 'zh-TW' ? 'AI 请求失败' : 'AI 请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (session?.currentTasks) {
      onConfirm(session.currentTasks);
      handleClose();
    }
  };

  const handleClose = () => {
    setSession(null);
    setInputMessage('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-2xl font-bold">
            ✨ {language === 'zh-TW' ? 'AI 项目规划' : 'AI 项目规划'}
          </h2>
        </ModalHeader>

        <ModalBody className="flex flex-col h-[600px]">
          {/* 对话历史区 */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {session?.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-neutral-400">
                <Spinner size="sm" />
                <span>{language === 'zh-TW' ? 'AI 思考中...' : 'AI 思考中...'}</span>
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区 */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'zh-TW' ? '输入你的要求...' : '输入你的要求...'}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                color="primary"
                isDisabled={!inputMessage.trim() || isLoading}
              >
                {language === 'zh-TW' ? '发送' : '发送'}
              </Button>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            onClick={handleClose}
          >
            {language === 'zh-TW' ? '取消' : '取消'}
          </Button>
          <Button
            variant="flat"
            onClick={() => {/* 重新生成逻辑 */}}
          >
            🔄 {language === 'zh-TW' ? '重新生成' : '重新生成'}
          </Button>
          <Button
            color="primary"
            onClick={handleConfirm}
            isDisabled={!session?.currentTasks?.length}
          >
            ✓ {language === 'zh-TW' ? '确认添加' : '确认添加'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
```

**验收标准**:
- Modal 正确显示
- 对话历史正确渲染
- 输入框和发送按钮正常工作
- 任务预览卡片正确显示

---

### 3.2 创建 ChatMessage 组件
- [x] 在 `AIPlanningModal.tsx` 中添加 `ChatMessage` 子组件
- [x] 实现 user/assistant 消息样式
- [x] 实现任务预览卡片

**文件**: `src/components/AIPlanningModal.tsx` (同文件)

**子组件**:
```tsx
const ChatMessage: React.FC<{ message: AIMessage }> = ({ message }) => {
  const isUser = message.role === AIMessageRole.USER;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl p-4 ${
        isUser
          ? 'bg-green-500 text-white'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>

        {message.taskPreview && message.taskPreview.length > 0 && (
          <div className="mt-4 space-y-2">
            {message.taskPreview.map((task, index) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl ${
                  task.isNew
                    ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300'
                    : 'bg-white dark:bg-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">
                    T{index + 1}: {task.title}
                  </span>
                  {task.isNew && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                      新增
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm opacity-80">{task.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs opacity-70">
                  {task.estimatedMinutes && (
                    <span>⏱ {task.estimatedMinutes}分钟</span>
                  )}
                  {task.tag && (
                    <span>🏷 {task.tag}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

**验收标准**:
- User 和 Assistant 消息样式区分明显
- 任务预览卡片正确显示

---

### 3.3 扩展 aiService.ts 添加多轮对话函数
- [x] 在 `src/services/aiService.ts` 中添加 `continuePlanningConversation`
- [x] 实现 `buildConversationalPrompt`
- [x] 实现 `parseAIResponse`

**文件**: `src/services/aiService.ts`

**新增函数**:
```typescript
export const continuePlanningConversation = async (
  session: AIPlanningSession,
  userMessage: string,
  config: AIConfig
): Promise<AIMessage> => {
  // 构建对话历史上下文
  const conversationHistory = session.messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  // 构建系统提示
  const systemPrompt = buildConversationalPrompt(session, userMessage);

  // 调用 AI (复用现有的 Gemini/OpenAI 兼容逻辑)
  const response = await callAIWithHistory(config, systemPrompt, conversationHistory);

  // 解析响应
  const parsedResponse = parseAIResponse(response);

  return {
    id: generateUUID(),
    role: AIMessageRole.ASSISTANT,
    content: parsedResponse.text,
    timestamp: Date.now(),
    taskPreview: parsedResponse.tasks,
  };
};

const buildConversationalPrompt = (
  session: AIPlanningSession,
  userMessage: string
): string => {
  const { mode, projectId, currentTasks } = session;

  // 当前任务状态摘要
  const tasksSummary = currentTasks.length > 0
    ? `\n## 当前已规划的任务\n${currentTasks.map((t, i) => `
${i + 1}. ${t.title}
   - 描述: ${t.description || '无'}
   - 预估: ${t.estimatedMinutes || '?'} 分钟
   - 依赖: ${t.parentIds.join(', ') || '无'}`).join('\n')}`
    : '\n## 当前状态\n尚未规划任何任务';

  return `
你是一个专业的项目规划顾问，正在与用户协作设计项目任务流。

## 项目
- 项目 ID: ${projectId}
- 规划模式: ${mode === 'zero-state' ? '从零开始' : '延续现有'}

${tasksSummary}

## 用户最新请求
${userMessage}

## 你的任务

1. **理解意图**：分析用户想要做什么（新增、修改、删除、细化任务）
2. **保持上下文**：基于当前任务状态进行操作
3. **自然对话**：用友好的语言回应用户
4. **输出格式**：
   - 必须以 JSON 格式返回任务列表
   - 任务 ID 必须保持一致（已存在的任务保持原 ID）
   - 新任务使用新的唯一 ID

## 响应格式

{
  "text": "你的回复文本，解释你做了什么",
  "tasks": [
    {
      "id": "existing-or-new-id",
      "title": "任务标题",
      "description": "任务描述",
      "estimatedMinutes": 30,
      "tag": "工作",
      "parentIds": ["parent-id"],
      "isNew": true
    }
  ]
}

## 输出语言
使用简体中文。
`;
};

const parseAIResponse = (response: string): {
  text: string;
  tasks?: TaskPreview[];
} => {
  try {
    const parsed = JSON.parse(response);
    return {
      text: parsed.text || '',
      tasks: parsed.tasks?.map((t: any) => ({
        ...t,
        isNew: t.isNew ?? false,
      })) || [],
    };
  } catch (e) {
    // 如果 JSON 解析失败，尝试提取文本
    return {
      text: response,
      tasks: [],
    };
  }
};
```

**验收标准**:
- 函数正确调用 AI API
- 响应正确解析

---

## Phase 4: 日历视图实现

### 4.1 创建 CalendarView 组件
- [x] 创建 `src/components/CalendarView.tsx`
- [x] 实现月度日历网格
- [x] 实现月份切换
- [x] 实现每日项目显示（最多 3 个）

**文件**: `src/components/CalendarView.tsx`

**组件结构**:
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

export const CalendarView: React.FC<CalendarViewProps> = ({
  year,
  month,
  tasks,
  projects,
  onMonthChange,
  onExportICS,
  language
}) => {
  const t = TRANSLATIONS[language];

  // 生成日历网格
  const calendarDays = useMemo(() => {
    return generateCalendarGrid(year, month);
  }, [year, month]);

  // 按日期分组任务
  const tasksByDate = useMemo(() => {
    return groupTasksByDate(tasks, year, month);
  }, [tasks, year, month]);

  const handlePrevMonth = () => {
    const date = new Date(year, month - 1, 1);
    onMonthChange(date.getFullYear(), date.getMonth());
  };

  const handleNextMonth = () => {
    const date = new Date(year, month + 1, 1);
    onMonthChange(date.getFullYear(), date.getMonth());
  };

  return (
    <div className="w-full">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {year}年{month + 1}月
        </h2>
        <div className="flex gap-2">
          <Button onClick={onExportICS} variant="flat">
            📥 {language === 'zh-TW' ? '导出 ICS' : '导出 ICS'}
          </Button>
          <Button isIconOnly onClick={handlePrevMonth}>
            <ChevronLeft />
          </Button>
          <Button isIconOnly onClick={handleNextMonth}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div key={day} className="text-center text-sm font-bold text-neutral-400">
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => (
          <DayCell
            key={day.toISOString()}
            date={day}
            tasks={tasksByDate[formatDateKey(day)] || []}
            projects={projects}
            isToday={isSameDay(day, new Date())}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};
```

**验收标准**:
- 日历正确显示指定月份
- 星期标题正确显示
- 日期单元格正确排列

---

### 4.2 创建 DayCell 组件
- [x] 在 `CalendarView.tsx` 中添加 `DayCell` 子组件
- [x] 实现项目条显示（最多 3 个）
- [x] 实现溢出半透明显示

**文件**: `src/components/CalendarView.tsx` (同文件)

**子组件**:
```tsx
const DayCell: React.FC<{
  date: Date;
  tasks: Task[];
  projects: Project[];
  isToday: boolean;
  language: Language;
}> = ({ date, tasks, projects, isToday, language }) => {
  // 按项目分组统计
  const projectDurations = useMemo(() => {
    const grouped = groupTasksByProject(tasks, projects);
    return grouped
      .map(item => ({
        ...item,
        durationMinutes: Math.round(item.durationMinutes),
      }))
      .sort((a, b) => b.durationMinutes - a.durationMinutes);
  }, [tasks, projects]);

  const VISIBLE_LIMIT = 3;
  const visibleProjects = projectDurations.slice(0, VISIBLE_LIMIT);
  const hasOverflow = projectDurations.length > VISIBLE_LIMIT;

  const totalMinutes = projectDurations.reduce((sum, p) => sum + p.durationMinutes, 0);

  return (
    <div className={`
      min-h-[80px] p-2 rounded-xl border
      ${isToday ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-neutral-100 dark:border-neutral-800'}
    `}>
      <div className="text-sm font-bold mb-1">
        {date.getDate()}
      </div>

      <div className="space-y-1">
        {visibleProjects.map((item) => (
          <div
            key={item.project.id}
            className="text-xs px-2 py-1 rounded truncate"
            style={{
              backgroundColor: item.project.color,
              opacity: 1,
              color: 'white',
            }}
          >
            {item.project.name} {formatMinutes(item.durationMinutes)}
          </div>
        ))}

        {/* 半透明显示溢出项目 */}
        {projectDurations.slice(VISIBLE_LIMIT).map((item) => (
          <div
            key={item.project.id}
            className="text-xs px-2 py-1 rounded truncate"
            style={{
              backgroundColor: item.project.color,
              opacity: 0.3,
              color: 'white',
            }}
          >
            {item.project.name} {formatMinutes(item.durationMinutes)}
          </div>
        ))}

        {hasOverflow && (
          <div className="text-xs text-neutral-400 text-center">
            +{projectDurations.length - VISIBLE_LIMIT} {language === 'zh-TW' ? '更多' : '更多'}
          </div>
        )}

        <div className="text-xs text-neutral-500 text-right">
          {language === 'zh-TW' ? '总计' : '总计'}: {formatMinutes(totalMinutes)}
        </div>
      </div>
    </div>
  );
};
```

**验收标准**:
- 每日正确显示项目时长
- 前 3 个项目完全显示
- 溢出项目半透明显示
- 总计时长正确计算

---

### 4.3 创建日历工具函数
- [x] 创建 `src/utils/calendarUtils.ts`
- [x] 实现 `generateCalendarGrid`
- [x] 实现 `groupTasksByDate`
- [x] 实现 `groupTasksByProject`
- [x] 实现 `formatDateKey`
- [x] 实现 `isSameDay`

**文件**: `src/utils/calendarUtils.ts`

```typescript
export const generateCalendarGrid = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: Date[] = [];

  // 填充月初空白
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(new Date(year, month, 1 - startDayOfWeek + i));
  }

  // 填充月份日期
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // 填充月末空白以完成 42 格 (6 行 × 7 列)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

export const groupTasksByDate = (
  tasks: Task[],
  year: number,
  month: number
): Record<string, Task[]> => {
  const grouped: Record<string, Task[]> = {};

  tasks.forEach(task => {
    task.logs.forEach(log => {
      const date = new Date(log.start);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const key = formatDateKey(date);
        if (!grouped[key]) {
          grouped[key] = [];
        }
        if (!grouped[key].includes(task)) {
          grouped[key].push(task);
        }
      }
    });
  });

  return grouped;
};

export const groupTasksByProject = (
  tasks: Task[],
  projects: Project[]
): Array<{ project: Project; durationMinutes: number }> => {
  const projectMap = new Map<string, number>();

  tasks.forEach(task => {
    const duration = task.totalTime;
    const projectId = task.projectId;

    if (projectId) {
      const current = projectMap.get(projectId) || 0;
      projectMap.set(projectId, current + duration);
    }
  });

  return Array.from(projectMap.entries())
    .filter(([id]) => projects.some(p => p.id === id))
    .map(([projectId, durationMs]) => ({
      project: projects.find(p => p.id === projectId)!,
      durationMinutes: durationMs / 1000 / 60,
    }));
};

export const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
};
```

**验收标准**:
- 函数正确处理日期计算
- 分组逻辑正确

---

### 4.4 更新 Stats 组件替换为日历视图
- [x] 修改 `src/components/Stats.tsx`
- [x] 移除原有图表
- [x] 集成 CalendarView

**文件**: `src/components/Stats.tsx`

**修改内容**:
- 导入 CalendarView
- 替换原有渲染逻辑
- 添加月份状态管理

```tsx
export const Stats: React.FC<StatsProps> = ({ tasks, language }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // 获取所有项目
  const projects = useProjects(); // 需要从 props 或 context 获取

  const handleExportICS = () => {
    exportTasksToICS(tasks, currentYear, currentMonth, language);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <CalendarView
        year={currentYear}
        month={currentMonth}
        tasks={tasks}
        projects={projects}
        onMonthChange={setCurrentYear, setCurrentMonth}
        onExportICS={handleExportICS}
        language={language}
      />
    </div>
  );
};
```

**验收标准**:
- 统计标签显示日历视图
- 月份切换正常工作

---

## Phase 5: ICS 导出功能

### 5.1 创建 ICS 生成器
- [x] 创建 `src/utils/icsGenerator.ts`
- [x] 实现 `generateICS`
- [x] 实现 `formatICSDate`
- [x] 实现 `downloadICSFile`

**文件**: `src/utils/icsGenerator.ts`

```typescript
export const generateICS = (
  tasks: Task[],
  projects: Project[],
  year: number,
  month: number,
  options: ICSExportOptions = {
    productName: 'ChronoFlow',
    timeZone: 'Asia/Shanghai',
    fileName: 'chronoflow-calendar.ics'
  }
): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChronoFlow//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${options.productName}`,
    `X-WR-TIMEZONE:${options.timeZone}`,
    'X-WR-CALDESC:ChronoFlow 应用导出的任务时间记录',
  ];

  // 按日期和项目分组
  const grouped = groupTasksByDateAndProject(tasks, projects, year, month);

  grouped.forEach(({ date, project, durationMinutes, taskList }) => {
    const startDate = new Date(date);
    const endDate = new Date(date.getTime() + durationMinutes * 60 * 1000);

    lines.push(
      'BEGIN:VEVENT',
      `UID:${generateUUID()}@chronoflow`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${project.name} (${formatMinutes(durationMinutes)})`,
      `DESCRIPTION:${taskList.map(t => t.title).join('\\n')}`,
      `LOCATION:ChronoFlow`,
      `END:VEVENT`
    );
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
};

export const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const downloadICSFile = (icsContent: string, fileName: string = 'chronoflow-calendar.ics') => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const groupTasksByDateAndProject = (
  tasks: Task[],
  projects: Project[],
  year: number,
  month: number
): Array<{
  date: string;
  project: Project;
  durationMinutes: number;
  taskList: Task[];
}> => {
  const result: Array<{
    date: string;
    project: Project;
    durationMinutes: number;
    taskList: Task[];
  }> = [];

  // 按日期分组
  const tasksByDate = groupTasksByDate(tasks, year, month);

  Object.entries(tasksByDate).forEach(([dateKey, dayTasks]) => {
    // 按项目分组
    const projectDurations = groupTasksByProject(dayTasks, projects);

    projectDurations.forEach(({ project, durationMinutes }) => {
      result.push({
        date: dateKey,
        project,
        durationMinutes,
        taskList: dayTasks.filter(t => t.projectId === project.id),
      });
    });
  });

  return result;
};

export const exportTasksToICS = (
  tasks: Task[],
  year: number,
  month: number,
  projects: Project[],
  language: Language
) => {
  const icsContent = generateICS(tasks, projects, year, month);
  const fileName = `chronoflow-${year}-${String(month + 1).padStart(2, '0')}.ics`;
  downloadICSFile(icsContent, fileName);
};
```

**验收标准**:
- ICS 文件格式正确
- 可被日历应用识别
- 下载功能正常工作

---

## Phase 6: 测试和清理

### 6.1 功能测试
- [ ] 测试零状态 AI 规划流程
- [ ] 测试延续状态 AI 规划流程
- [ ] 测试多轮对话交互
- [ ] 测试日历视图显示
- [ ] 测试 ICS 导出
- [ ] 测试移动端交互

**验收标准**:
- 所有功能正常工作
- 无控制台错误

---

### 6.2 清理删除的组件
- [x] 删除 `src/components/AIProjectGenerator.tsx`
- [x] 删除 `src/components/AIInsights.tsx`
- [x] 删除 `src/components/AISettingsModalHeroUI.tsx` (如果存在且未使用)

**验收标准**:
- 文件已删除
- 无未使用的导入

---

### 6.3 更新翻译文件
- [x] 在 `src/constants.ts` 中移除不再使用的翻译键
- [x] 添加新的翻译键（如需要）

**验收标准**:
- 翻译正确显示

---

## 实施顺序建议

```
Day 1: Phase 1-2 (基础架构和 UI 组件)
├── Phase 1: 准备工作 (1 小时)
└── Phase 2: AI 规划整合 (1.5 小时)

Day 2: Phase 3 (多轮对话)
└── Phase 3: AI 多轮对话实现 (2 小时)

Day 3: Phase 4 (日历视图)
└── Phase 4: 日历视图实现 (2 小时)

Day 4: Phase 5-6 (导出和测试)
├── Phase 5: ICS 导出 (1 小时)
└── Phase 6: 测试和清理 (1.5 小时)
```

## 文件修改清单

| 文件 | 修改类型 | 新增行数 | 删除行数 |
|------|----------|----------|----------|
| `src/types.ts` | 新增 | ~50 | 0 |
| `src/constants.ts` | 修改 | ~0 | ~2 |
| `src/App.tsx` | 修改 | ~0 | ~10 |
| `src/components/ProjectManager.tsx` | 修改 | ~50 | ~10 |
| `src/components/Stats.tsx` | 重写 | ~100 | ~150 |
| `src/services/aiService.ts` | 新增 | ~150 | 0 |
| `src/components/AIPlanningModal.tsx` | 新增 | ~200 | 0 |
| `src/components/CalendarView.tsx` | 新增 | ~250 | 0 |
| `src/components/ProjectZeroState.tsx` | 新增 | ~40 | 0 |
| `src/components/SplitActionButton.tsx` | 新增 | ~60 | 0 |
| `src/utils/icsGenerator.ts` | 新增 | ~100 | 0 |
| `src/utils/calendarUtils.ts` | 新增 | ~80 | 0 |
| `src/components/AIProjectGenerator.tsx` | 删除 | 0 | ~150 |
| `src/components/AIInsights.tsx` | 删除 | 0 | ~200 |
| **总计** | | **~1080** | **~522** |

## 风险和注意事项

1. **AI 多轮对话复杂性**：需要正确处理会话状态和上下文
2. **ICS 格式兼容性**：确保生成的 ICS 文件符合 RFC 5545 标准
3. **日历性能**：大量任务时需要优化渲染性能
4. **移动端交互**：确保 Click 展开在移动端正常工作
5. **状态同步**：AI Modal 中的任务预览需要与实际任务同步
