
import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus, AIAnalysisResult } from "../types";

export const generateProductivityAnalysis = async (tasks: Task[]): Promise<AIAnalysisResult> => {
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED || t.totalTime > 0);
  
  if (completedTasks.length === 0) {
    throw new Error("No sufficient data to analyze. Please complete or track some tasks first.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const taskSummary = completedTasks.map(t => ({
    title: t.title,
    tags: t.tags ? t.tags.join(', ') : 'None',
    durationMinutes: Math.round(t.totalTime / 1000 / 60),
    status: t.status
  }));

  const prompt = `
    Analyze the following task history and provide a high-level productivity coaching report.
    Historical Task Data: ${JSON.stringify(taskSummary)}
    
    Requirements:
    1. Summary: Provide a 2-3 sentence overview of the time allocation and general productivity trend.
    2. Suggestions: Provide 3-5 actionable, high-impact improvements for better time management.
    3. Score: A single number from 0-100 representing productivity health.

    Context: The user is using a task timer app called ChronoFlow to track their workflow.
    Language: Please match the professional tone and language of the provided task names (e.g., if tasks are in Chinese, provide insights in Chinese).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
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
    if (text) {
      return JSON.parse(text.trim()) as AIAnalysisResult;
    }
    throw new Error("Empty response from AI assistant.");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
