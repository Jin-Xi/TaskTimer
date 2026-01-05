
import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus, AIAnalysisResult } from "../types";

// Fix: Removed local process declaration to rely on the environment-provided process.env as per guidelines.

export const generateProductivityAnalysis = async (tasks: Task[]): Promise<AIAnalysisResult> => {
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED || t.totalTime > 0);
  
  if (completedTasks.length === 0) {
    throw new Error("No sufficient data to analyze.");
  }

  // Fix: Initializing GoogleGenAI right before usage to ensure current API key access.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const taskSummary = completedTasks.map(t => ({
    title: t.title,
    tags: t.tags ? t.tags.join(', ') : 'None',
    durationMinutes: Math.round(t.totalTime / 1000 / 60),
    status: t.status
  }));

  const prompt = `
    Analyze the following task history and provide productivity insights.
    Data: ${JSON.stringify(taskSummary)}
    
    Provide a summary of where time was spent, suggest improvements for time management based on the tags and durations, and give a productivity score (0-100).
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
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
          // Fix: Using propertyOrdering instead of required to match SDK example patterns for content generation.
          propertyOrdering: ["summary", "suggestions", "productivityScore"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as AIAnalysisResult;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
