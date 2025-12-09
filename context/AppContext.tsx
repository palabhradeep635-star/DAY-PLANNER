
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Task, UserSettings, UserProfile } from '../types';
import { cloudService } from '../services/cloudService';
import { authService } from '../services/authService';
import { sendNotification } from '../utils/calendar';

interface AppContextType {
  tasks: Task[];
  settings: UserSettings;
  user: UserProfile | null;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  loading: boolean;
  syncing: boolean;
  toggleTaskTimer: (id: string) => void;
  clearCache: () => void;
  login: (email: string, password?: string, isSocial?: boolean, provider?: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
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
    googleAccount: false
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // States for UX
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Debounce ref for syncing
  const syncTimeoutRef = useRef<number | null>(null);
  
  // Ref for notification throttling
  const lastNotificationTimeRef = useRef<number>(0);

  // 1. Initial Load from "Cloud"
  useEffect(() => {
    const init = async () => {
      try {
        const data = await cloudService.fetchData();
        setTasks(data.tasks);
        if (data.settings) setSettings({ ...INITIAL_SETTINGS, ...data.settings });
        setUser(data.user);
      } catch (err) {
        console.error("Failed to load from cloud", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 2. Sync to "Cloud" on changes
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
    }, 2000); // 2 second debounce to simulate batching

    // Apply Theme immediately locally
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', settings.gradientTheme);

  }, [tasks, settings, loading]);

  // Timer Interval & Dynamic Notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update Timer Logic
      setTasks(currentTasks => {
        const hasRunning = currentTasks.some(t => t.timerRunning);
        if (!hasRunning) return currentTasks;

        return currentTasks.map(t => {
          if (t.timerRunning && t.timerStartTime) {
            return {
              ...t,
              actualMinutes: t.actualMinutes + (1/60), 
            };
          }
          return t;
        });
      });

      // 2. Dynamic Notification Logic
      // Only check if notifications enabled and not currently loading
      if (settings.notificationsEnabled && !loading) {
        const now = Date.now();
        // Check if we haven't notified in the last 15 minutes (900,000 ms)
        // For quicker demo purposes, setting to 1 minute (60,000 ms) in development
        const NOTIFICATION_COOLDOWN = 60000 * 15; 

        if (now - lastNotificationTimeRef.current > NOTIFICATION_COOLDOWN) {
          const pendingHighPriority = tasks.find(t => t.isToday && t.priority === 'High' && t.status !== 'Done');
          
          if (pendingHighPriority) {
            sendNotification(
              "High Priority Task", 
              `Don't forget to tackle "${pendingHighPriority.title}" today!`
            );
            lastNotificationTimeRef.current = now;
          } else {
             const pendingCount = tasks.filter(t => t.isToday && t.status !== 'Done').length;
             if (pendingCount > 0) {
                 const msgs = [
                    "Keep up the momentum!",
                    `${pendingCount} tasks remaining for today. You got this!`,
                    "Consistency is key. Ready for another session?"
                 ];
                 const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
                 sendNotification("Study Update", randomMsg);
                 lastNotificationTimeRef.current = now;
             }
          }
        }
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [settings.notificationsEnabled, tasks, loading]);

  const addTask = (task: Task) => setTasks(prev => [...prev, task]);
  
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, lastEdited: Date.now() } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ 
      ...prev, 
      ...updates,
      integrations: { ...prev.integrations, ...(updates.integrations || {}) }
    }));
  };

  const toggleTaskTimer = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (t.timerRunning) {
          return { ...t, timerRunning: false, timerStartTime: undefined };
        } else {
          return { ...t, timerRunning: true, timerStartTime: Date.now() };
        }
      } else if (t.timerRunning) {
        return { ...t, timerRunning: false, timerStartTime: undefined };
      }
      return t;
    }));
  };

  const clearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  // --- AUTHENTICATION ---

  const login = async (email: string, password?: string, isSocial: boolean = false, provider: string = 'email') => {
    setSyncing(true);
    
    try {
      let userProfile: UserProfile;

      if (isSocial) {
        if (provider === 'google') {
           userProfile = await authService.signInWithGoogle();
        } else if (provider === 'x') {
           userProfile = await authService.signInWithX();
        } else {
           userProfile = await authService.signInWithMicrosoft();
        }
      } else {
        // Mock DB Check for email
        // In a real app, cloudService.login(email, password)
        await new Promise(r => setTimeout(r, 1000));
        // Simple mock validation
        if (password === 'password') { 
             userProfile = { name: email.split('@')[0], email };
        } else {
             // For simulation, accept any password if it's not specific test case
             userProfile = { name: email.split('@')[0], email };
        }
      }

      setUser(userProfile);
      updateSettings({ 
        name: userProfile.name,
        integrations: { ...settings.integrations, googleAccount: isSocial && provider === 'google' } 
      });
      await cloudService.saveUser(userProfile);

    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    
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
    updateSettings({ integrations: { ...settings.integrations, googleAccount: false } });
    setSyncing(false);
  };

  return (
    <AppContext.Provider value={{ tasks, settings, user, addTask, updateTask, deleteTask, updateSettings, loading, syncing, toggleTaskTimer, clearCache, login, signup, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
