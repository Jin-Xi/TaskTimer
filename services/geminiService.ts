import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus } from "../types";

// Initialize Gemini Client
// NOTE: In a real production app, ensure this is behind a proxy or the key is restricted.
// The user prompt specified purely frontend, so we use process.env.API_KEY directly as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductivityAnalysis = async (tasks: Task[]): Promise<any> => {
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED || t.totalTime > 0);
  
  if (completedTasks.length === 0) {
    throw new Error("No sufficient data to analyze.");
  }

  // Prepare data for the model
  const taskSummary = completedTasks.map(t => ({
    title: t.title,
    category: t.category,
    durationMinutes: Math.round(t.totalTime / 1000 / 60),
    status: t.status
  }));

  const prompt = `
    Analyze the following task history and provide productivity insights.
    Data: ${JSON.stringify(taskSummary)}
    
    Provide a summary of where time was spent, suggest improvements for time management, and give a productivity score (0-100) based on focus and completion.
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
          required: ["summary", "suggestions", "productivityScore"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
