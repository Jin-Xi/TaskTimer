import { Task } from "../types";

const STORAGE_KEY = 'chronoflow_tasks_v1';

export const loadTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load tasks", e);
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Failed to save tasks", e);
  }
};

export const downloadTasksAsJson = (tasks: Task[]) => {
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `chronoflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  linkElement.remove();
};

export const validateImportedData = (data: any): Task[] | null => {
  // Basic validation check
  if (!Array.isArray(data)) return null;
  
  // Check if the first item (if exists) has minimal required properties
  if (data.length > 0) {
    const sample = data[0];
    if (!sample.id || !sample.title || !sample.status) {
      return null;
    }
  }
  
  return data as Task[];
};