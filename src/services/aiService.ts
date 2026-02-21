
import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus, AIAnalysisResult, AIConfig, Language, Project } from "../types";

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
    4. Define dependencies: If Task B cannot start before Task A, set Task A's ID as parent of Task B.
    5. Keep task titles concise but actionable.
    
    Response Format (JSON):
    {
      "projectName": "String",
      "description": "String",
      "color": "String (one of: indigo, emerald, slate, rose, amber, cyan, violet, fuchsia)",
      "tasks": [
        {
          "id": "String (use temporary simple IDs like 't1', 't2')",
          "title": "String",
          "description": "String",
          "estimatedMinutes": Number,
          "tag": "String",
          "parentIds": ["String (optional ID of prerequisite task)"]
        }
      ]
    }
`;

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

  if (config.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: config.model || 'gemini-3-pro-preview',
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

  // Fallback for other providers (omitted for brevity, assume similar structure)
  throw new Error("Only Gemini is supported for this feature currently.");
};

export const generateProjectPlan = async (goal: string, context: string, config: AIConfig, language: Language = 'zh-CN') => {
  const systemInstruction = getSystemInstruction(language);
  const userPrompt = getPlannerPrompt(goal, context, language);

  if (config.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: config.model || 'gemini-3-pro-preview',
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
  
  throw new Error("AI provider not configured for planning.");
};
