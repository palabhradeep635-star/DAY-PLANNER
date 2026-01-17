export type Phase = string;
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'Not started' | 'In progress' | 'Done';
export type TaskType = 'Lecture' | 'Practice' | 'Revision' | 'Notes' | 'Misc';
export type AIProvider = 'gemini' | 'chatgpt';
export type GradientTheme = 'cosmic' | 'emerald' | 'sunset' | 'ocean' | 'midnight' | 'rgb' | 'toxic' | 'nebula' | 'monolith';

export interface TaskSyncMetadata {
  googleCalendarId?: string;
  notionPageId?: string;
  microsoftTaskId?: string;
  lastSyncedAt?: number;
}

export interface Task {
  id: string;
  phase: Phase;
  topic?: string;
  day: string;
  code: string;
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
  syncMetadata?: TaskSyncMetadata;
}

export interface Integrations {
  googleCalendar: boolean;
  notion: boolean;
  googleAccount: boolean;
  microsoftTasks: boolean;
}

export interface UserSettings {
  name: string;
  theme: 'light' | 'dark';
  gradientTheme: GradientTheme;
  notificationsEnabled: boolean;
  dailyGoal: number; 
  onboardingCompleted: boolean;
  aiProvider: AIProvider;
  lastAiPrompt: string; 
  integrations: Integrations;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export const PHASES: Record<string, string> = {
  P1: 'Arrays & Basics',
  P2: 'Strings & Sorting',
  P3: 'Recursion & Backtracking',
  P4: 'Trees & Graphs'
};

export const TASK_TYPES: TaskType[] = ['Lecture', 'Practice', 'Revision', 'Notes', 'Misc'];
export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
export const STATUSES: Status[] = ['Not started', 'In progress', 'Done'];