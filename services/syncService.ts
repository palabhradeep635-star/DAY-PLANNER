import { Task, TaskSyncMetadata } from '../types';

const NETWORK_DELAY = 1200;

export const syncService = {
  syncTaskToGoogleCalendar: async (task: Task): Promise<string> => {
    console.log(`[Sync] Pushing "${task.title}" to Google Calendar...`);
    await new Promise(r => setTimeout(r, NETWORK_DELAY));
    return `gc-${Math.random().toString(36).substr(2, 9)}`;
  },

  syncTaskToNotion: async (task: Task): Promise<string> => {
    console.log(`[Sync] Pushing "${task.title}" to Notion Workspace...`);
    await new Promise(r => setTimeout(r, NETWORK_DELAY + 400));
    return `notion-${Math.random().toString(36).substr(2, 9)}`;
  },

  syncTaskToMicrosoftTasks: async (task: Task): Promise<string> => {
    console.log(`[Sync] Pushing "${task.title}" to Microsoft To Do...`);
    await new Promise(r => setTimeout(r, NETWORK_DELAY - 200));
    return `ms-${Math.random().toString(36).substr(2, 9)}`;
  },

  syncAll: async (task: Task, integrations: { googleCalendar: boolean, notion: boolean, microsoftTasks: boolean }): Promise<TaskSyncMetadata> => {
    const metadata: TaskSyncMetadata = { ...task.syncMetadata, lastSyncedAt: Date.now() };

    const promises = [];
    
    if (integrations.googleCalendar && !metadata.googleCalendarId) {
      promises.push(syncService.syncTaskToGoogleCalendar(task).then(id => metadata.googleCalendarId = id));
    }
    
    if (integrations.notion && !metadata.notionPageId) {
      promises.push(syncService.syncTaskToNotion(task).then(id => metadata.notionPageId = id));
    }

    if (integrations.microsoftTasks && !metadata.microsoftTaskId) {
      promises.push(syncService.syncTaskToMicrosoftTasks(task).then(id => metadata.microsoftTaskId = id));
    }

    await Promise.all(promises);
    return metadata;
  }
};