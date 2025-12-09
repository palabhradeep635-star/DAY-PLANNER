import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '../types';

// NOTE: In a production environment, never expose keys on client side.
// This is structured for the provided runtime environment where process.env.API_KEY is injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyPlan = async (
  currentTasks: Task[],
  userPrompt?: string
): Promise<Partial<Task>[]> => {
  
  // Determine next day code logic
  const codes = currentTasks.map(t => t.code).sort();
  const lastCode = codes[codes.length - 1] || 'P1D0';
  const match = lastCode.match(/P(\d+)D(\d+)/);
  let nextCode = 'P1D1';
  let phase = 'P1';
  let day = 'D1';

  if (match) {
    const p = parseInt(match[1]);
    const d = parseInt(match[2]);
    phase = `P${p}`;
    day = `D${d + 1}`;
    nextCode = `${phase}${day}`;
  }

  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert Data Structures and Algorithms tutor. 
    Generate a study plan for the next day of studying.
    The current day code is ${nextCode}.
    The user is currently on Phase ${phase}.
    
    Create 3-5 tasks that are balanced between learning (Lecture) and doing (Practice).
    Focus on: ${userPrompt || "Standard DSA curriculum progression"}.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate tasks for ${nextCode}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              details: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['Lecture', 'Practice', 'Revision', 'Notes'] },
              priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
              estimateMinutes: { type: Type.INTEGER },
            },
            required: ["title", "details", "type", "priority", "estimateMinutes"],
          },
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Map to internal structure partials
      return data.map((item: any) => ({
        ...item,
        phase,
        day,
        code: nextCode,
        status: 'Not started',
        isToday: false,
        actualMinutes: 0
      }));
    }
    return [];
  } catch (error) {
    console.error("Gemini AI generation failed:", error);
    throw error;
  }
};