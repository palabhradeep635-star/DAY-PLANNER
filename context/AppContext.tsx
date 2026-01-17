import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Task, UserSettings, UserProfile } from '../types';
import { cloudService } from '../services/cloudService';
import { authService } from '../services/authService';
import { syncService } from '../services/syncService';

interface AppContextType {
  tasks: Task[];
  settings: UserSettings;
  user: UserProfile | null;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  bulkUpdateTasks: (updates: Record<string, Partial<Task>>) => void;
  deleteTask: (id: string) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  loading: boolean;
  syncing: boolean;
  toggleTaskTimer: (id: string) => void;
  clearCache: () => void;
  login: (email: string, password?: string, isSocial?: boolean, provider?: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  triggerScheduleSync: (taskId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_SETTINGS: UserSettings = {
  name: '',
  theme: 'dark', 
  gradientTheme: 'cosmic',
  notificationsEnabled: false,
  dailyGoal: 3,
  onboardingCompleted: false,
  aiProvider: 'gemini',
  lastAiPrompt: '',
  integrations: {
    googleCalendar: false,
    notion: false,
    googleAccount: false,
    microsoftTasks: false
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const syncTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await cloudService.fetchData();
        setTasks(data.tasks || []);
        if (data.settings) {
          const mergedSettings = { ...INITIAL_SETTINGS, ...data.settings };
          setSettings(mergedSettings);
          document.documentElement.setAttribute('data-theme', mergedSettings.gradientTheme);
        } else {
          document.documentElement.setAttribute('data-theme', INITIAL_SETTINGS.gradientTheme);
        }
        setUser(data.user);
      } catch (err) {
        console.error("Failed to load from cloud", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (loading) return;
    setSyncing(true);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = window.setTimeout(async () => {
      try {
        await cloudService.syncData(tasks, settings);
      } catch (err) {
        console.error("Sync failed", err);
      } finally {
        setSyncing(false);
      }
    }, 2000);
    document.documentElement.setAttribute('data-theme', settings.gradientTheme);
  }, [tasks, settings, loading]);

  const triggerScheduleSync = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const { googleCalendar, notion, microsoftTasks } = settings.integrations;
    if (!googleCalendar && !notion && !microsoftTasks) return;

    setSyncing(true);
    try {
      const metadata = await syncService.syncAll(task, { googleCalendar, notion, microsoftTasks });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, syncMetadata: metadata } : t));
    } catch (e) {
      console.error("Schedule sync failed", e);
    } finally {
      setSyncing(false);
    }
  };

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    // Auto-sync new task if integrations are active
    setTimeout(() => triggerScheduleSync(task.id), 500);
  };
  
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, lastEdited: Date.now() } : t));
    // Trigger re-sync if status changes or title changes
    if (updates.status || updates.title) {
      setTimeout(() => triggerScheduleSync(id), 500);
    }
  };

  const bulkUpdateTasks = (updates: Record<string, Partial<Task>>) => {
    setTasks(prev => prev.map(t => {
      if (updates[t.id]) {
        return { ...t, ...updates[t.id], lastEdited: Date.now() };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const updateSettings = (updates: Partial<UserSettings>) => setSettings(prev => ({ ...prev, ...updates }));

  const toggleTaskTimer = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, timerRunning: !t.timerRunning, timerStartTime: !t.timerRunning ? Date.now() : undefined };
      }
      return { ...t, timerRunning: false, timerStartTime: undefined };
    }));
  };

  const clearCache = () => { localStorage.clear(); window.location.reload(); };

  const login = async (email: string, password?: string, isSocial: boolean = false, provider: string = 'email') => {
    setSyncing(true);
    try {
      let userProfile: UserProfile;
      if (isSocial) {
        userProfile = provider === 'google' ? await authService.signInWithGoogle() : await authService.signInWithX();
      } else {
        userProfile = { name: email.split('@')[0], email };
      }
      setUser(userProfile);
      updateSettings({ name: userProfile.name });
      await cloudService.saveUser(userProfile);
    } catch (err) {
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setSyncing(true);
    const userProfile = { name, email };
    setUser(userProfile);
    await cloudService.saveUser(userProfile);
    updateSettings({ name });
    setSyncing(false);
  };

  const logout = async () => {
    setSyncing(true);
    await cloudService.logoutUser();
    setUser(null);
    setSyncing(false);
  };

  const upgradeToPro = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncing(false);
  };

  return (
    <AppContext.Provider value={{ tasks, settings, user, addTask, updateTask, bulkUpdateTasks, deleteTask, updateSettings, loading, syncing, toggleTaskTimer, clearCache, login, signup, logout, upgradeToPro, triggerScheduleSync }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};