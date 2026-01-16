
import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus, AIAnalysisResult, AIConfig } from "../types";

const SYSTEM_INSTRUCTION = `
    You are a professional high-level productivity coach for the app "ChronoFlow".
    Analyze the provided task history and provide a high-level coaching report.
    
    Requirements:
    1. Summary: 2-3 sentence overview of time allocation and general productivity trend.
    2. Suggestions: 3-5 actionable, high-impact improvements for better time management.
    3. Score: A number from 0-100 representing productivity health.

    Language: Match the professional tone and language of the provided task names.
`;

const getPrompt = (taskSummary: any[]) => `
    Historical Task Data: ${JSON.stringify(taskSummary)}
    
    Provide the response in structured JSON format with:
    {
      "summary": "string",
      "suggestions": ["string", "string", ...],
      "productivityScore": number
    }
`;

export const generateProductivityAnalysis = async (tasks: Task[], config?: AIConfig): Promise<AIAnalysisResult> => {
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED || t.totalTime > 0);
  
  if (completedTasks.length === 0) {
    throw new Error("No sufficient data to analyze. Please complete or track some tasks first.");
  }

  const taskSummary = completedTasks.map(t => ({
    title: t.title,
    tags: t.tags ? t.tags.join(', ') : 'None',
    durationMinutes: Math.round(t.totalTime / 1000 / 60),
    status: t.status
  }));

  // Default to Gemini if no config or explicitly Gemini
  if (!config || config.provider === 'gemini') {
    const apiKey = config?.apiKey || process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found for Gemini.");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: config?.model || 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: getPrompt(taskSummary) }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
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
          required: ["summary", "suggestions", "productivityScore"]
        },
      },
    });

    return JSON.parse(response.text || '{}') as AIAnalysisResult;
  }

  // Handle OpenAI-compatible providers (DeepSeek, OpenAI, etc.)
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
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: getPrompt(taskSummary) }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Failed to fetch from AI provider");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content) as AIAnalysisResult;
};
