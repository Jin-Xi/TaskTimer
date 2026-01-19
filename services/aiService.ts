
import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus, AIAnalysisResult, AIConfig } from "../types";

const getSystemInstruction = (lang: 'en' | 'zh') => `
    You are a professional high-level productivity coach for the app "ChronoFlow".
    Analyze the provided task history and provide a high-level coaching report.
    
    CRITICAL: You MUST provide the output in ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
    
    Requirements:
    1. Summary: 2-3 sentence overview of time allocation and general productivity trend.
    2. Suggestions: 3-5 actionable, high-impact improvements for better time management.
    3. Score: A number from 0-100 representing productivity health.
`;

const getPrompt = (taskSummary: any[], lang: 'en' | 'zh') => `
    Historical Task Data: ${JSON.stringify(taskSummary)}
    
    Provide the response in structured JSON format in ${lang === 'zh' ? 'Chinese' : 'English'}:
    {
      "summary": "...",
      "suggestions": ["...", "...", ...],
      "productivityScore": number
    }
`;

export const generateProductivityAnalysis = async (tasks: Task[], config: AIConfig, language: 'en' | 'zh' = 'zh'): Promise<AIAnalysisResult> => {
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED || t.totalTime > 0);
  
  if (completedTasks.length === 0) {
    throw new Error(language === 'zh' ? "没有足够的数据。请先记录一些任务。" : "No sufficient data. Please track some tasks first.");
  }

  const taskSummary = completedTasks.map(t => ({
    title: t.title,
    tags: t.tags ? t.tags.join(', ') : 'None',
    durationMinutes: Math.round(t.totalTime / 1000 / 60),
    status: t.status
  }));

  const systemInstruction = getSystemInstruction(language);
  const userPrompt = getPrompt(taskSummary, language);

  // Fix: Strictly use process.env.API_KEY, select 'gemini-3-pro-preview' for complex text tasks, and access output via .text property.
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

  const endpoint = config.baseUrl || 
    (config.provider === 'deepseek' ? 'https://api.deepseek.com/v1' : 'https://api.openai.com/v1');
  
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "AI failed");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content) as AIAnalysisResult;
};
