
import { Task, TaskStatus, AIAnalysisResult, AIConfig, Language, Project } from "../types";

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

const getPlannerPrompt = (goal: string, context: string, lang: Language) => `
    User Goal: "${goal}"
    Context/Constraints: "${context}"

    Please decompose this goal into a structured project plan with concrete tasks.

    Rules for decomposition:
    1. Create a logical hierarchy (Work Breakdown Structure).
    2. Estimate realistic duration for each task in minutes.
    3. Suggest a relevant category/tag for each task (e.g., '工作', '学习', '创意', '运动').
    4. CRITICAL: Define task dependencies to create a meaningful workflow:
       - Each task (except the first) should have at least one parent task
       - Build dependencies based on logical sequence (preparation → execution → review)
       - Example: For reading a book: t1"了解书籍结构" → t2"制定阅读计划" → t3"阅读第一章" → t4"整理笔记" → t5"写读后感"
       - Set parentIds as an array of prerequisite task IDs (e.g., ["t1"] or ["t1", "t2"])
    5. Keep task titles concise but actionable.

    Response Format (JSON):
    {
      "projectName": "String",
      "description": "String",
      "color": "String (one of: green, ochre, slate-river, amber, cyan)",
      "tasks": [
        {
          "id": "String (use temporary simple IDs like 't1', 't2')",
          "title": "String",
          "description": "String",
          "estimatedMinutes": Number,
          "tag": "String",
          "parentIds": ["String (array of prerequisite task IDs - create dependencies!)"]
        }
      ]
    }
`;

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
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedMinutes: { type: Type.NUMBER },
                  tag: { type: Type.STRING },
                  parentIds: { type: Type.ARRAY, items: { type: Type.STRING } }
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
    return JSON.parse(text);
  }

  // OpenAI-compatible providers (OpenAI, DeepSeek, Custom)
  if (config.provider === 'openai' || config.provider === 'deepseek' || config.provider === 'custom') {
    const content = await callOpenAICompatibleAPI(config, systemInstruction, userPrompt);

    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error(`AI 返回了无效的 JSON: ${content}`);
    }
  }

  throw new Error(`不支持的提供商: ${config.provider}`);
};
