
import { GoogleGenAI, Type } from "@google/genai";
import { Task, AIProvider } from '../types';

/**
 * Utility to clean AI response string from markdown blocks.
 */
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

/**
 * Global handler for AI errors, triggering key selection if needed.
 */
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

/**
 * Generates a dynamic greeting based on system state.
 */
export const generateNeuralGreeting = async (
  userName: string,
  time: string,
  tasksLeft: number,
  totalTasks: number,
  activeTaskTitle?: string,
  currentScreen: string = 'today'
): Promise<{ p: string; s: string; sub: string; icon: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Act as the APEX AI Interface. Generate a hyper-specific, SITUATIONAL status update for user ${userName}.
    
    ENVIRONMENTAL INPUTS:
    - Chronos: ${time}
    - Synchronization Load: ${totalTasks - tasksLeft}/${totalTasks} units.
    - Active Focus Directive: ${activeTaskTitle || 'Nexus Standby (Deep Sleep)'}
    - UI Sector: ${currentScreen.toUpperCase()}
    - Entropy Hash: ${Math.random().toString(36).substring(2, 15)} (MANDATORY: Use this seed to ensure the output is different from all previous cycles).

    CONSTRAINTS:
    1. Tone: Cybernetic, peak-performance, futuristic, and slightly intense.
    2. Vocabulary: Use high-level tech jargon (e.g., Heuristic, Parallelism, Neural Spikes, Flux Density, Buffer Overdrive, Logic Gates, Quantization).
    3. Non-Repetition: Do NOT use generic phrases like "Welcome back" or "Keep going". Invent new technical statuses.
    4. Icon Logic: Select the most representative icon: [zap (energy), flame (intensity), rocket (speed), activity (pulse), brain (logic), calendar (vectors)].

    SCHEMA:
    {
      "p": "UPPERCASE_SECTOR (1-2 words, e.g., COGNITIVE_OVERDRIVE)",
      "s": "UPPERCASE_MESSAGE (1-3 words, e.g., SYNC_IGNITED)",
      "sub": "Detailed technical status sentence ending in '...' (e.g., Calibrating heuristic logic gates for ${activeTaskTitle || 'system standby'}...)",
      "icon": "icon_key"
    }`;

    // Always use .text property directly, not as a function.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            p: { type: Type.STRING },
            s: { type: Type.STRING },
            sub: { type: Type.STRING },
            icon: { type: Type.STRING }
          },
          required: ["p", "s", "sub", "icon"]
        },
        temperature: 1.0,
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    const result = JSON.parse(cleanAIResponse(text));
    return result as { p: string; s: string; sub: string; icon: string };
  } catch (error) {
    console.warn("AI Greeting Sync Failure, using fallback.", error);
    return FALLBACK_GREETINGS[Math.floor(Math.random() * FALLBACK_GREETINGS.length)];
  }
};

/**
 * Reorders tasks for optimal cognitive load.
 */
export const prioritizeDailyTasks = async (tasks: Task[]): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const taskData = tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, time: t.estimateMinutes }));
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sequence these tasks for optimal cognitive load: ${JSON.stringify(taskData)}`,
      config: {
        systemInstruction: "You are the Apex Scheduler. Reorder the provided task IDs based on the following logic: 1. High priority items first. 2. Shorter 'Quick Win' tasks (under 30m) to build momentum. 3. Alternate between practice and theory. Return ONLY a JSON array of task IDs in the new optimal order.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const result = JSON.parse(cleanAIResponse(response.text || "[]"));
    return (Array.isArray(result) ? result : []) as string[];
  } catch (error) {
    await handleAIError(error);
    return tasks.map(t => t.id);
  }
};

/**
 * Groups directives into logical sectors.
 */
export const partitionNeuralSectors = async (tasks: Task[]): Promise<Record<string, string>> => {
  if (!tasks.length) return {};
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const taskData = tasks.map(t => ({ id: t.id, title: t.title, details: t.details }));
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Group these directives into logical, context-aware sectors: ${JSON.stringify(taskData)}`,
      config: {
        systemInstruction: "Categorize tasks into 3-5 logical sectors with highly descriptive, aesthetic names. Return a JSON array of objects with 'id' and 'topic' fields.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topic: { type: Type.STRING }
            },
            required: ["id", "topic"]
          }
        }
      }
    });
    const results = JSON.parse(cleanAIResponse(response.text || "[]"));
    const mapping: Record<string, string> = {};
    if (Array.isArray(results)) {
      results.forEach((item: any) => { 
        if (item && typeof item === 'object' && item.id && item.topic) {
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

/**
 * Generates a full study plan based on user prompt.
 */
export const generateStudyPlan = async (
  currentTasks: Task[],
  provider: AIProvider,
  userPrompt?: string,
  deepThink: boolean = false
): Promise<Partial<Task>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Selecting model according to task complexity and Gemini 3 Flash/Pro preview rules.
  const modelName = deepThink ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Generate 3 study tasks for: "${userPrompt || 'Standard DSA Curriculum'}".`,
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
              topic: { type: Type.STRING }
            },
            required: ["title", "details", "type", "priority", "estimateMinutes", "topic"],
          },
        },
      },
    });
    const results = JSON.parse(cleanAIResponse(response.text || "[]"));
    return (Array.isArray(results) ? results : []).map((t: any) => ({ ...t, isToday: true }));
  } catch (error) {
    await handleAIError(error);
    return [];
  }
};

/**
 * Refines and optimizes task content using AI.
 */
export const optimizeTaskContent = async (task: Partial<Task>): Promise<Partial<Task>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Refine this directive: "${task.title}".`,
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
    const refined = JSON.parse(cleanAIResponse(response.text || "{}"));
    return { ...task, ...(refined || {}) };
  } catch (error) {
    return task;
  }
};
