import { Task, Category } from "../types";

const STORAGE_KEY = 'chronoflow_tasks_v1';
const CATEGORIES_KEY = 'chronoflow_categories_v2'; // Bumped version for new structure

export const loadTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    
    // Migration: Convert old tasks with 'category' string to 'tags' array
    return parsed.map((t: any) => ({
      ...t,
      tags: t.tags ? t.tags : (t.category ? [t.category] : []),
      category: undefined // Cleanup old field
    }));
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

export const loadCategories = (defaults: Category[]): Category[] => {
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (data) return JSON.parse(data);

    // Fallback: Check for v1 string-only categories and migrate
    const v1Data = localStorage.getItem('chronoflow_categories_v1');
    if (v1Data) {
      const strings: string[] = JSON.parse(v1Data);
      const migrated = strings.map((s, i) => ({
        id: `migrated-${i}`,
        name: s,
        color: 'slate'
      }));
      return migrated;
    }

    return defaults;
  } catch (e) {
    console.error("Failed to load categories", e);
    return defaults;
  }
};

export const saveCategories = (categories: Category[]) => {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error("Failed to save categories", e);
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
  if (!Array.isArray(data)) return null;
  if (data.length > 0) {
    const sample = data[0];
    if (!sample.id || !sample.title || !sample.status) {
      return null;
    }
  }
  return data as Task[];
};