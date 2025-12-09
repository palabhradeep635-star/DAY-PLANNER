
export type Phase = 'P1' | 'P2' | 'P3' | 'P4';
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Not started' | 'In progress' | 'Done';
export type TaskType = 'Lecture' | 'Practice' | 'Revision' | 'Notes' | 'Misc';
export type AIProvider = 'gemini' | 'chatgpt';
export type GradientTheme = 'cosmic' | 'emerald' | 'sunset' | 'ocean' | 'midnight' | 'rgb';

export interface Task {
  id: string;
  phase: Phase;
  day: string; // e.g., "D1"
  code: string; // e.g., "P1D1"
  title: string;
  details: string;
  type: TaskType;
  priority: Priority;
  status: Status;
  estimateMinutes: number;
  actualMinutes: number;
  isToday: boolean;
  lastEdited: number;
  timerRunning?: boolean;
  timerStartTime?: number;
}

export interface Integrations {
  googleCalendar: boolean;
  notion: boolean;
  googleAccount: boolean;
}

export interface UserSettings {
  name: string;
  theme: 'light' | 'dark';
  gradientTheme: GradientTheme;
  notificationsEnabled: boolean;
  dailyGoal: number; 
  onboardingCompleted: boolean;
  aiProvider: AIProvider;
  lastAiPrompt: string; // Persist the last used prompt
  integrations: Integrations;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export const PHASES: Record<Phase, string> = {
  P1: 'Arrays & Basics',
  P2: 'Strings & Sorting',
  P3: 'Recursion & Backtracking',
  P4: 'Trees & Graphs'
};

export const TASK_TYPES: TaskType[] = ['Lecture', 'Practice', 'Revision', 'Notes', 'Misc'];
export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
export const STATUSES: Status[] = ['Not started', 'In progress', 'Done'];
