
import { Task, UserSettings, UserProfile } from '../types';

// Simulates a Cloud Firestore / MongoDB connection
const NETWORK_DELAY = 800; // ms

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const cloudService = {
  // Sync Data (Push/Pull)
  syncData: async (tasks: Task[], settings: UserSettings): Promise<void> => {
    await delay(NETWORK_DELAY);
    // In a real app, this would POST to an API
    localStorage.setItem('dsa-tasks', JSON.stringify(tasks));
    localStorage.setItem('dsa-settings', JSON.stringify(settings));
    return;
  },

  // Fetch Data (Pull)
  fetchData: async (): Promise<{ tasks: Task[], settings: UserSettings | null, user: UserProfile | null }> => {
    await delay(NETWORK_DELAY + 500); // Initial load is slightly longer
    const t = localStorage.getItem('dsa-tasks');
    const s = localStorage.getItem('dsa-settings');
    const u = localStorage.getItem('dsa-user');

    return {
      tasks: t ? JSON.parse(t) : [],
      settings: s ? JSON.parse(s) : null,
      user: u ? JSON.parse(u) : null
    };
  },

  // Auth operations
  saveUser: async (user: UserProfile) => {
    await delay(NETWORK_DELAY);
    localStorage.setItem('dsa-user', JSON.stringify(user));
  },

  logoutUser: async () => {
    await delay(500);
    localStorage.removeItem('dsa-user');
  }
};
    