
import { Task, TaskStatus, AIAnalysisResult, AIConfig, Language, Project, AIMessageRole, AIMessage, TaskPreview, AIPlanningSession } from "../types";

// Provider endpoints for OpenAI-compatible APIs
const PROVIDER_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  custom: '' // Will use config.baseUrl
};

const getSystemInstruction = (lang: Language) => `
    You are a professional high-level productivity coach for the app "ChronoFlow".
    
    CRITICAL: You MUST provide the output in ${lang === 'zh-TW' ? 'Traditional Chinese (zh-TW)' : 'Simplified Chinese (zh-CN)'}.
`;

const getAnalysisPrompt = (taskSummary: any[], lang: Language) => `
    Analyze the provided task history and provide a high-level coaching report.
    Historical Task Data: ${JSON.stringify(taskSummary)}
    
    Provide the response in structured JSON format in ${lang === 'zh-TW' ? 'Traditional Chinese' : 'Simplified Chinese'}:
    {
      "summary": "...",
      "suggestions": ["...", "...", ...],
      "productivityScore": number
    }
`;

/**
 * 新架构：AI 生成章节（chapters），JS 代码将章节转换为流水线
 * 这样大模型只需要关注内容的组织，不需要处理复杂的链表结构
 */
const getPlannerPrompt = (goal: string, context: string, lang: Language) => `
    User Goal: "${goal}"
    Context/Constraints: "${context}"

    Please create an initial project plan with ONE pipeline (chapter).

    ## 核心规则（必须严格遵守）

    ### 1. 只生成一条流水线
    - **一次只创建一个章节**：这是初始规划，只创建第一条流水线
    - **用户可以后续添加更多**：通过对话可以添加更多流水线（最多5条）

    ### 2. 任务数量
    - **每个章节至少 3 个任务**：确保流水线有足够的步骤
    - **任务数量无上限**：可以根据需要添加任意数量的任务
    - **任务按执行顺序排列**：第一个 → 第二个 → 第三个 → ...

    ### 3. 正确示例（半马训练的第一条流水线）
    \`\`\`json
    {
      "projectName": "半程马拉松训练",
      "description": "为期12周的训练计划",
      "color": "green",
      "chapters": [
        {
          "title": "体能基础阶段",
          "description": "建立跑步基础体能",
          "tasks": [
            {"title": "体能评估", "description": "测试当前体能水平", "estimatedMinutes": 60, "tag": "运动"},
            {"title": "基础跑步训练", "description": "5公里慢跑训练", "estimatedMinutes": 45, "tag": "运动"},
            {"title": "配速练习", "description": "提升配速到6分钟/公里", "estimatedMinutes": 40, "tag": "运动"},
            {"title": "长距离慢跑", "description": "10公里慢跑", "estimatedMinutes": 70, "tag": "运动"},
            {"title": "间歇训练", "description": "400米间歇跑", "estimatedMinutes": 50, "tag": "运动"},
            {"title": "恢复跑", "description": "轻松3公里", "estimatedMinutes": 25, "tag": "运动"}
          ]
        }
      ]
    }
    \`\`\`

    ### 4. 错误示例（不要这样！）
    - ❌ 一次生成多个章节
    - ❌ 任务少于3个
    - ❌ 任务没有明确的执行顺序

    ## 其他规则
    - 估算每个任务的时长（分钟）
    - 为任务分配合适的标签（如：运动、学习、工作）
    - 任务标题简洁可执行

    Response Format (JSON):
    {
      "projectName": "String",
      "description": "String",
      "color": "String (one of: green, ochre, slate-river, amber, cyan)",
      "chapters": [
        {
          "title": "String",
          "description": "String",
          "tasks": [
            {
              "title": "String",
              "description": "String",
              "estimatedMinutes": Number,
              "tag": "String"
            }
          ]
        }
      ]
    }
`;

/**
 * 将 AI 生成的章节结构转换为流水线任务列表
 * - 每个章节 = 一条流水线
 * - 章节内的任务按顺序串联（A→B→C→D）
 * - 第一个任务的 parentId = null，后续任务的 parentId = 前一个任务的 id
 */
const chaptersToPipelines = (result: any): any => {
  if (!result.chapters || !Array.isArray(result.chapters)) {
    return result;
  }

  const tasks: any[] = [];
  let taskIndex = 1;

  result.chapters.forEach((chapter: any, chapterIndex: number) => {
    if (!chapter.tasks || !Array.isArray(chapter.tasks)) {
      return;
    }

    let previousTaskId: string | null = null;

    chapter.tasks.forEach((task: any) => {
      const taskId = `t${taskIndex}`;
      const pipelineTask = {
        id: taskId,
        title: task.title || `任务 ${taskIndex}`,
        description: task.description || '',
        estimatedMinutes: task.estimatedMinutes || 30,
        tag: task.tag || chapter.title, // 默认使用章节名作为标签
        parentId: previousTaskId,
        chapterTitle: chapter.title, // 保留章节信息用于显示
        chapterIndex: chapterIndex
      };

      tasks.push(pipelineTask);
      previousTaskId = taskId;
      taskIndex++;
    });
  });

  console.log(`Converted ${result.chapters.length} chapters to ${tasks.length} tasks in ${result.chapters.length} pipelines`);

  return {
    projectName: result.projectName,
    description: result.description,
    color: result.color,
    tasks
  };
};

// Unified API call function for OpenAI-compatible providers
async function callOpenAICompatibleAPI(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const endpoint = config.provider === 'custom'
    ? `${config.baseUrl}/chat/completions`
    : PROVIDER_ENDPOINTS[config.provider];

  if (!endpoint) {
    throw new Error(`Unknown provider: ${config.provider}`);
  }

  const apiKey = config.apiKey || import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 AI API 密钥");
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const body: any = {
    model: config.model,
    messages,
    temperature: 0.7,
    response_format: { type: 'json_object' }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${error}`);
  }

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('API 返回了空响应');
  }

  return data.choices[0].message.content;
}

export const generateProductivityAnalysis = async (tasks: Task[], config: AIConfig, language: Language = 'zh-CN'): Promise<AIAnalysisResult> => {
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED || t.totalTime > 0);
  
  if (completedTasks.length === 0) {
    throw new Error(language === 'zh-TW' ? "沒有足夠的數據。請先記錄一些任務。" : "没有足够的数据。请先记录一些任务。");
  }

  const taskSummary = completedTasks.map(t => ({
    title: t.title,
    tags: t.tags ? t.tags.join(', ') : 'None',
    durationMinutes: Math.round(t.totalTime / 1000 / 60),
    status: t.status
  }));

  const systemInstruction = getSystemInstruction(language);
  const userPrompt = getAnalysisPrompt(taskSummary, language);

  // Gemini provider (using SDK for structured output)
  if (config.provider === 'gemini') {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const apiKey = config.apiKey || import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      throw new Error(language === 'zh-TW' ? "未配置 AI API 密鑰" : "未配置 AI API 密钥");
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: config.model || 'gemini-2.5-pro-exp-03-25',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            productivityScore: { type: Type.NUMBER },
          },
          propertyOrdering: ["summary", "suggestions", "productivityScore"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }
    return JSON.parse(text) as AIAnalysisResult;
  }

  // OpenAI-compatible providers (OpenAI, DeepSeek, Custom)
  if (config.provider === 'openai' || config.provider === 'deepseek' || config.provider === 'custom') {
    const content = await callOpenAICompatibleAPI(config, systemInstruction, userPrompt);

    try {
      return JSON.parse(content) as AIAnalysisResult;
    } catch (e) {
      throw new Error(`AI 返回了无效的 JSON: ${content}`);
    }
  }

  throw new Error(`不支持的提供商: ${config.provider}`);
};

export const generateProjectPlan = async (goal: string, context: string, config: AIConfig, language: Language = 'zh-CN') => {
  const systemInstruction = getSystemInstruction(language);
  const userPrompt = getPlannerPrompt(goal, context, language);

  // Gemini provider (using SDK for structured output)
  if (config.provider === 'gemini') {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const apiKey = config.apiKey || import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      throw new Error(language === 'zh-TW' ? "未配置 AI API 密鑰" : "未配置 AI API 密钥");
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: config.model || 'gemini-2.5-pro-exp-03-25',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: { type: Type.STRING },
            description: { type: Type.STRING },
            color: { type: Type.STRING },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        estimatedMinutes: { type: Type.NUMBER },
                        tag: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }
    const result = JSON.parse(text);
    return chaptersToPipelines(result);
  }

  // OpenAI-compatible providers (OpenAI, DeepSeek, Custom)
  if (config.provider === 'openai' || config.provider === 'deepseek' || config.provider === 'custom') {
    const content = await callOpenAICompatibleAPI(config, systemInstruction, userPrompt);

    try {
      const result = JSON.parse(content);
      return chaptersToPipelines(result);
    } catch (e) {
      throw new Error(`AI 返回了无效的 JSON: ${content}`);
    }
  }

  throw new Error(`不支持的提供商: ${config.provider}`);
};

// Multi-turn conversation functions for AI planning
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * 将当前任务列表按流水线分组显示（用于对话上下文）
 */
const groupTasksByPipeline = (tasks: any[]): string => {
  if (!tasks || tasks.length === 0) {
    return '\n## 当前状态\n尚未规划任何任务';
  }

  // 按 parentId 构建流水线
  const taskMap = new Map<string, any>();
  const rootTasks: any[] = [];

  tasks.forEach((t: any) => {
    taskMap.set(t.id, t);
    if (!t.parentId) {
      rootTasks.push(t);
    }
  });

  const lines: string[] = ['\n## 当前已规划的任务'];

  rootTasks.forEach((rootTask, pipelineIndex) => {
    lines.push(`\n### 流水线 ${pipelineIndex + 1}`);

    // 遍历这条流水线
    let currentTask: any = rootTask;
    let taskNum = 1;
    while (currentTask) {
      lines.push(`${taskNum}. ${currentTask.title} (ID: ${currentTask.id})`);
      if (currentTask.description) {
        lines.push(`   - 描述: ${currentTask.description}`);
      }
      if (currentTask.estimatedMinutes) {
        lines.push(`   - 预估: ${currentTask.estimatedMinutes} 分钟`);
      }

      // 找下一个任务
      const nextTask = tasks.find((t: any) => t.parentId === currentTask.id);
      currentTask = nextTask;
      taskNum++;
    }
  });

  return lines.join('\n');
};

const buildConversationalPrompt = (
  session: any,
  userMessage: string,
  language: Language
): string => {
  const { projectId, currentTasks } = session;

  const tasksSummary = groupTasksByPipeline(currentTasks);
  const pipelineCount = currentTasks ? currentTasks.filter((t: any) => !t.parentId).length : 0;

  return `
你是一个专业的任务规划顾问，正在与用户协作设计任务流。

## 规划信息
- 规划 ID: ${projectId}
- 当前流水线数量: ${pipelineCount}（最多5条）

${tasksSummary}

## 用户最新请求
${userMessage}

## 核心规则（必须严格遵守）

### 1. 每次只生成一条流水线
- **一次只创建一个章节**：不要一次性生成多个章节
- **章节 = 流水线**：每个章节代表一条独立的任务流水线
- **任务按顺序执行**：第一个任务完成后，才能开始第二个

### 2. 任务数量要求
- **每个章节至少 3 个任务**：确保流水线有足够的步骤
- **任务数量无上限**：可以根据需要添加任意数量的任务
- **任务按顺序执行**：第一个 → 第二个 → 第三个 → ...

### 3. 正确示例（一次只生成一个章节）
\`\`\`json
{
  "text": "我为你创建了「体能基础阶段」流水线，包含4个按顺序执行的任务...",
  "chapters": [
    {
      "title": "体能基础阶段",
      "description": "建立跑步基础体能",
      "tasks": [
        {"title": "体能评估", "description": "测试当前体能水平", "estimatedMinutes": 60, "tag": "运动"},
        {"title": "基础跑步训练", "description": "5公里慢跑", "estimatedMinutes": 45, "tag": "运动"},
        {"title": "配速练习", "description": "提升配速", "estimatedMinutes": 40, "tag": "运动"}
      ]
    }
  ]
}
\`\`\`

### 4. 错误示例（不要这样！）
- ❌ 一次生成多个章节
- ❌ 章节只有1个任务
- ❌ 任务没有明确的执行顺序

## 你的任务

1. **理解意图**：分析用户想要创建什么主题的流水线
2. **生成单条流水线**：只创建一个章节，包含按顺序排列的任务
3. **检查限制**：如果已有5条流水线，提示用户需要先删除或合并
4. **自然对话**：用友好的语言回应用户

## 响应格式

{
  "text": "你的回复文本，解释你创建了什么",
  "chapters": [
    {
      "title": "章节标题（流水线名称）",
      "description": "章节描述",
      "tasks": [
        {
          "title": "任务1（第一个执行）",
          "description": "任务描述",
          "estimatedMinutes": 30,
          "tag": "标签"
        },
        {
          "title": "任务2（第二个执行）",
          "description": "任务描述",
          "estimatedMinutes": 45,
          "tag": "标签"
        }
      ]
    }
  ]
}

## 输出语言
使用${language === 'zh-TW' ? '繁體中文' : '简体中文'}。
`;
};

/**
 * Parses AI 响应 (章节格式)
 * 将章节转换为流水线任务链
 */
const parseAIResponse = (response: string): {
  text: string;
  tasks?: TaskPreview[];
} => {
  try {
    const parsed = JSON.parse(response);

    // 检查1: 确保返回的是有效对象
    if (!parsed || typeof parsed !== 'object') {
      console.warn('AI response is not a valid object:', parsed);
      return {
        text: response,
        tasks: []
      };
    }

    // 如果返回的是章节格式， 转换为流水线
    if (parsed.chapters && Array.isArray(parsed.chapters)) {
      const converted = chaptersToPipelines(parsed);
      return {
        text: parsed.text || '',
        tasks: converted.tasks?.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          estimatedMinutes: t.estimatedMinutes,
          tag: t.tag,
          parentId: t.parentId,
          isNew: true // 新生成的任务
        }))
      };
    }

    // 如果返回的是任务格式 (向后兼容)
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      const tasks = parsed.tasks;
      const fixedTasks: TaskPreview[] = [];
      const taskIds = new Set<string>();
      tasks.forEach((t: any) => {
        if (t.id) taskIds.add(t.id);
      });

      tasks.forEach((t: any) => {
        const fixedTask: TaskPreview = {
          id: t.id || crypto.randomUUID(),
          title: t.title || '',
          description: t.description || '',
          estimatedMinutes: t.estimatedMinutes,
          tag: t.tag,
          parentId: null,
          isNew: t.isNew ?? true
        };

        if (t.parentId && typeof t.parentId === 'string' && taskIds.has(t.parentId)) {
          fixedTask.parentId = t.parentId;
        }

        fixedTasks.push(fixedTask);
      });

      return {
        text: parsed.text || '',
        tasks: fixedTasks
      };
    }

    return {
      text: parsed.text || '',
      tasks: []
    };
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    return {
      text: response,
      tasks: []
    };
  }
};

export const continuePlanningConversation = async (
  session: any,
  userMessage: string,
  config: AIConfig,
  language: Language = 'zh-CN'
): Promise<any> => {
  const systemPrompt = buildConversationalPrompt(session, userMessage, language);

  // Gemini provider - use single-turn API for now
  if (config.provider === 'gemini') {
    const { GoogleGenAI, Type } = await import("@google/genai");
    const apiKey = config.apiKey || import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      throw new Error(language === 'zh-TW' ? "未配置 AI API 密鑰" : "未配置 AI API 密钥");
    }
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: config.model || 'gemini-2.5-pro-exp-03-25',
      contents: systemPrompt,
      config: {
        systemInstruction: getSystemInstruction(language),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        estimatedMinutes: { type: Type.NUMBER },
                        tag: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const parsedResponse = parseAIResponse(text);

    return {
      id: generateUUID(),
      role: 'assistant',
      content: parsedResponse.text,
      timestamp: Date.now(),
      taskPreview: parsedResponse.tasks,
    };
  }

  // DeepSeek, OpenAI, and other OpenAI-compatible providers
  if (config.provider === 'deepseek' || config.provider === 'openai' || config.provider === 'custom') {
    const response = await callOpenAICompatibleAPI(
      config,
      getSystemInstruction(language),
      systemPrompt
    );

    const parsedResponse = parseAIResponse(response);

    return {
      id: generateUUID(),
      role: 'assistant',
      content: parsedResponse.text,
      timestamp: Date.now(),
      taskPreview: parsedResponse.tasks,
    };
  }

  throw new Error(`不支持的提供商: ${config.provider}`);
};
