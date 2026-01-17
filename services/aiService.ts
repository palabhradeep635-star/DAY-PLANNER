
import { GoogleGenAI, Type } from "@google/genai";
import { Task, AIProvider } from '../types';

const cleanAIResponse = (raw: string): string => {
  if (!raw) return "[]";
  try {
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : cleaned;
  } catch {
    return raw;
  }
};

const handleAIError = async (error: any) => {
  const errorMessage = error?.message || String(error);
  console.error("APEX Neural Sync Error:", errorMessage);

  if (
    errorMessage.includes("Requested entity was not found") || 
    errorMessage.includes("API key") ||
    errorMessage.includes("401") ||
    errorMessage.includes("403") ||
    errorMessage.includes("API_KEY")
  ) {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      return "KEY_SELECTION_TRIGGERED";
    }
  }
  throw error;
};

const FALLBACK_GREETINGS = [
  { p: "NEURAL_LINK", s: "ESTABLISHING_SYNC", sub: "Handshaking with Apex Cloud...", icon: "activity" },
  { p: "CORE_READY", s: "DIRECTIVE_OPTIMIZED", sub: "All systems nominal.", icon: "zap" },
  { p: "FOCUS_LEVEL", s: "MAX_VELOCITY", sub: "Neural pathways cleared.", icon: "flame" },
  { p: "SYSTEM_IDLE", s: "AWAITING_INPUT", sub: "Directives pending injection.", icon: "brain" }
];

export const generateNeuralGreeting = async (
  userName: string,
  time: string,
  tasksLeft: number,
  totalTasks: number
): Promise<{ p: string; s: string; sub: string; icon: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Generate a cyberpunk motivational greeting for ${userName}. 
    Current Time: ${time}. 
    Tasks Remaining: ${tasksLeft}/${totalTasks}. 
    Context: User is in a high-stakes performance session. 
    Tone: Sophisticated, technical, high-velocity. 
    Use words like: SYNCHRONIZED, OPTIMIZED, ARCHITECT, PROTOCOL, VELOCITY, NEXUS.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            p: { type: Type.STRING, description: "Primary punchy status (e.g. CORE_IGNITION)" },
            s: { type: Type.STRING, description: "Secondary greeting (e.g. VELOCITY_MAXIMIZED)" },
            sub: { type: Type.STRING, description: "Subtext detail with log feel" },
            icon: { type: Type.STRING, description: "Icon key: zap, flame, rocket, activity, brain" }
          },
          required: ["p", "s", "sub", "icon"]
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response");
    // Explicitly casting JSON.parse result to the expected greeting type
    return JSON.parse(cleanAIResponse(text)) as { p: string; s: string; sub: string; icon: string };
  } catch (error) {
    return FALLBACK_GREETINGS[Math.floor(Math.random() * FALLBACK_GREETINGS.length)];
  }
};

export const partitionNeuralSectors = async (tasks: Task[]): Promise<Record<string, string>> => {
  if (!tasks.length) return {};
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const taskData = tasks.map(t => ({ id: t.id, title: t.title, details: t.details }));
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Group these directives into logical, context-aware sectors: ${JSON.stringify(taskData)}`,
      config: {
        systemInstruction: "You are the Apex Architect. Categorize tasks into 3-5 logical sectors with highly descriptive, aesthetic names (e.g., 'Core Logic Engines', 'User Nexus UI', 'Persistence Layer Protocols', 'Neural Algorithm Hub'). Ensure the naming is sophisticated and matches a high-tech study/dev environment. Return a JSON array of objects with 'id' and 'topic' fields.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "The original task ID" },
              topic: { type: Type.STRING, description: "The sophisticated sector name" }
            },
            required: ["id", "topic"]
          }
        }
      }
    });

    // Explicitly casting JSON.parse result to avoid unknown/any type issues
    const results = JSON.parse(cleanAIResponse(response.text || "[]")) as any[];
    const mapping: Record<string, string> = {};
    
    if (Array.isArray(results)) {
      results.forEach((item: any) => {
        if (item.id && item.topic) {
          mapping[item.id] = item.topic;
        }
      });
    }
    
    return mapping;
  } catch (error) {
    await handleAIError(error).catch(() => {});
    throw error;
  }
};

export const generateStudyPlan = async (
  currentTasks: Task[],
  provider: AIProvider,
  userPrompt?: string,
  deepThink: boolean = false
): Promise<Partial<Task>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = deepThink ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Generate a set of 3 sophisticated study/work tasks based on this intent: "${userPrompt || 'Standard DSA Curriculum'}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              details: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['Lecture', 'Practice', 'Revision', 'Notes', 'Misc'] },
              priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
              estimateMinutes: { type: Type.INTEGER },
              topic: { type: Type.STRING, description: "A contextually relevant sector name" }
            },
            required: ["title", "details", "type", "priority", "estimateMinutes", "topic"],
          },
        },
      },
    });
    
    // Explicitly casting JSON.parse result to avoid unknown/any type issues
    const results = JSON.parse(cleanAIResponse(response.text || "[]")) as any[];
    // Explicitly inject isToday: true for all generated plans
    return results.map((t: any) => ({ ...t, isToday: true }));
  } catch (error) {
    await handleAIError(error);
    return [];
  }
};

export const optimizeTaskContent = async (task: Partial<Task>): Promise<Partial<Task>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Refine this directive for maximum clarity and aesthetic naming: "${task.title}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            details: { type: Type.STRING },
            estimateMinutes: { type: Type.INTEGER },
            topic: { type: Type.STRING }
          },
          required: ["title", "details", "estimateMinutes", "topic"]
        }
      }
    });
    // Explicitly casting JSON.parse result to Partial<Task>
    return { ...task, ...(JSON.parse(cleanAIResponse(response.text || "{}")) as Partial<Task>) };
  } catch (error) {
    return task;
  }
};
