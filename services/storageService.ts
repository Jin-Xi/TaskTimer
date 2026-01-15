
import { io, Socket } from "socket.io-client";
import { Task, Category, Project } from "../types";

const SERVER_URL = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;
const STORAGE_KEYS = {
  TASKS: 'chrono_tasks_v2',
  CATEGORIES: 'chrono_categories_v2',
  PROJECTS: 'chrono_projects_v2'
};

let socket: Socket;

export const initSocket = () => {
    if (!socket && typeof window !== 'undefined') {
        socket = io(SERVER_URL, {
            reconnectionDelayMax: 10000,
            transports: ['websocket', 'polling'],
            autoConnect: false // Don't block UI if server is down
        });
        
        socket.on('connect', () => console.log('Connected to sync server'));
    }
    return socket;
};

// --- Local Helpers ---
const getLocal = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const saveLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- Real-time Subscriptions (with Local Fallback) ---

export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const localTasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  callback(localTasks);

  const s = initSocket();
  if (!s) return () => {};
  s.connect();

  s.on('init', (data) => {
    if (data.tasks) {
      saveLocal(STORAGE_KEYS.TASKS, data.tasks);
      callback(data.tasks);
    }
  });

  s.on('sync_tasks', (tasks: Task[]) => {
    saveLocal(STORAGE_KEYS.TASKS, tasks);
    callback(tasks);
  });

  return () => { s.off('sync_tasks'); s.disconnect(); };
};

export const subscribeToCategories = (callback: (categories: Category[]) => void, defaults: Category[]) => {
  const localCats = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, defaults);
  callback(localCats);

  const s = initSocket();
  if (!s) return () => {};

  s.on('init', (data) => {
    if (data.categories?.length > 0) {
      saveLocal(STORAGE_KEYS.CATEGORIES, data.categories);
      callback(data.categories);
    }
  });

  s.on('sync_categories', (categories: Category[]) => {
    saveLocal(STORAGE_KEYS.CATEGORIES, categories);
    callback(categories);
  });

  return () => { s.off('sync_categories'); };
};

export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  const localProjs = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
  callback(localProjs);

  const s = initSocket();
  if (!s) return () => {};

  s.on('init', (data) => {
    if (data.projects) {
      saveLocal(STORAGE_KEYS.PROJECTS, data.projects);
      callback(data.projects);
    }
  });

  s.on('sync_projects', (projects: Project[]) => {
    saveLocal(STORAGE_KEYS.PROJECTS, projects);
    callback(projects);
  });

  return () => { s.off('sync_projects'); };
};

// --- CRUD Operations ---

export const addTask = async (task: Task) => {
  const tasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  const updated = [...tasks, task];
  saveLocal(STORAGE_KEYS.TASKS, updated);

  const s = initSocket();
  if (s?.connected) s.emit('updateData', { type: 'tasks', action: 'add', data: task });
  return updated;
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const tasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
  saveLocal(STORAGE_KEYS.TASKS, updated);

  const s = initSocket();
  if (s?.connected) s.emit('updateData', { type: 'tasks', action: 'update', data: { id: taskId, ...updates } });
  return updated;
};

export const deleteTask = async (taskId: string) => {
  const tasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  const updated = tasks.filter(t => t.id !== taskId);
  saveLocal(STORAGE_KEYS.TASKS, updated);

  const s = initSocket();
  if (s?.connected) s.emit('updateData', { type: 'tasks', action: 'delete', data: { id: taskId } });
  return updated;
};

export const addCategory = async (category: Category) => {
  const cats = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const updated = [...cats, category];
  saveLocal(STORAGE_KEYS.CATEGORIES, updated);

  const s = initSocket();
  if (s?.connected) s.emit('updateData', { type: 'categories', action: 'add', data: category });
  return updated;
};

export const deleteCategory = async (categoryId: string) => {
  const cats = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  const updated = cats.filter(c => c.id !== categoryId);
  saveLocal(STORAGE_KEYS.CATEGORIES, updated);

  const s = initSocket();
  if (s?.connected) s.emit('updateData', { type: 'categories', action: 'delete', data: { id: categoryId } });
  return updated;
};

export const addProject = async (project: Project) => {
  const projs = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
  const updated = [...projs, project];
  saveLocal(STORAGE_KEYS.PROJECTS, updated);

  const s = initSocket();
  if (s?.connected) s.emit('updateData', { type: 'projects', action: 'add', data: project });
  return updated;
};

export const deleteProject = async (projectId: string) => {
  const projs = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
  const updated = projs.filter(p => p.id !== projectId);
  saveLocal(STORAGE_KEYS.PROJECTS, updated);

  const s = initSocket();
  if (s?.connected) s.emit('updateData', { type: 'projects', action: 'delete', data: { id: projectId } });
  return updated;
};

/**
 * Triggers a download of the provided tasks array as a JSON file.
 */
export const downloadTasksAsJson = (tasks: Task[]) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "chronoflow_tasks_backup.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const validateImportedData = (data: any): Task[] | null => {
  if (!Array.isArray(data)) return null;
  return data.every(t => t.id && t.title && t.status) ? (data as Task[]) : null;
};
