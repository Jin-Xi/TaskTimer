import { Task, Category, Project, TaskStatus } from "../types";
import { DEFAULT_CATEGORIES } from "../constants";

const STORAGE_KEYS = {
  TASKS: 'chrono_tasks_v3',
  CATEGORIES: 'chrono_categories_v3',
  PROJECTS: 'chrono_projects_v3'
};

const minsAgo = (m: number) => Date.now() - (m * 60 * 1000);

const DEMO_DATA = {
  tasks: [
    {
      id: 'task-demo-1',
      title: '阅读《原子习惯》',
      description: '每天阅读30分钟，建立良好的微习惯。',
      tags: ['学习'],
      status: TaskStatus.COMPLETED,
      totalTime: 1800000,
      createdAt: minsAgo(180),
      logs: [{ start: minsAgo(150), end: minsAgo(120) }],
      milestones: [],
      parentTaskIds: []
    },
    {
      id: 'task-demo-2',
      title: '晨间运动',
      description: '有氧运动或瑜伽。',
      tags: ['运动'],
      status: TaskStatus.COMPLETED,
      totalTime: 2700000,
      createdAt: minsAgo(300),
      logs: [{ start: minsAgo(290), end: minsAgo(245) }],
      milestones: [{ id: 'm-gym-1', title: '完成热身', timestamp: minsAgo(280), branch: 'main' }],
      projectId: 'project-demo-life',
      parentTaskIds: []
    },
    {
      id: 'task-demo-3',
      title: '回复工作邮件',
      description: '处理收件箱中的未读消息。',
      tags: ['工作'],
      status: TaskStatus.IDLE,
      totalTime: 0,
      createdAt: minsAgo(60),
      logs: [],
      milestones: [],
      projectId: 'project-demo-work',
      parentTaskIds: []
    },
    {
      id: 'task-demo-4',
      title: '整理周报',
      description: '汇总本周工作进度。',
      tags: ['工作'],
      status: TaskStatus.IDLE,
      totalTime: 0,
      createdAt: minsAgo(50),
      logs: [],
      milestones: [],
      projectId: 'project-demo-work',
      parentTaskIds: ['task-demo-3']
    }
  ] as Task[],
  projects: [
    {
      id: 'project-demo-life',
      name: '健康生活',
      description: '保持身心健康的日常习惯。',
      createdAt: minsAgo(1000),
      color: 'emerald'
    },
    {
      id: 'project-demo-work',
      name: '日常工作流',
      description: '高效处理日常办公事务。',
      createdAt: minsAgo(800),
      color: 'indigo'
    }
  ] as Project[]
};

const getLocal = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    const parsed = JSON.parse(data);
    // Ensure we don't return null/undefined if storage is corrupted
    if (parsed === null || parsed === undefined) return fallback;
    return parsed;
  } catch (e) {
    console.error('Error parsing local storage:', e);
    return fallback;
  }
};

const saveLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const localTasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  if (localTasks.length === 0) {
    callback(DEMO_DATA.tasks);
    saveLocal(STORAGE_KEYS.TASKS, DEMO_DATA.tasks);
  } else {
    callback(localTasks);
  }
  return () => {};
};

export const subscribeToCategories = (callback: (categories: Category[]) => void, defaults: Category[]) => {
  let localCats = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, defaults);

  // Data Recovery: If categories are empty (user deleted all or init issue), restore defaults
  if (!localCats || localCats.length === 0) {
    localCats = defaults;
    saveLocal(STORAGE_KEYS.CATEGORIES, localCats);
  }

  callback(localCats);
  return () => {};
};

export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  const localProjs = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
  if (localProjs.length === 0) {
    callback(DEMO_DATA.projects);
    saveLocal(STORAGE_KEYS.PROJECTS, DEMO_DATA.projects);
  } else {
    callback(localProjs);
  }
  return () => {};
};

export const addTask = async (task: Task) => {
  const tasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  const updated = [...tasks, task];
  saveLocal(STORAGE_KEYS.TASKS, updated);
  return updated;
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const tasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
  saveLocal(STORAGE_KEYS.TASKS, updated);
  return updated;
};

export const deleteTask = async (taskId: string) => {
  const tasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  const updated = tasks.filter(t => t.id !== taskId);
  saveLocal(STORAGE_KEYS.TASKS, updated);
  return updated;
};

export const deleteTasks = async (taskIds: string[]) => {
  const tasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  const updated = tasks.filter(t => !taskIds.includes(t.id));
  saveLocal(STORAGE_KEYS.TASKS, updated);
  return updated;
};

export const deleteTasksByProjectId = async (projectId: string) => {
  const tasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  const updated = tasks.filter(t => t.projectId !== projectId);
  saveLocal(STORAGE_KEYS.TASKS, updated);
  return updated;
};

export const addCategory = async (category: Category) => {
  let cats = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  // Ensure we don't lose defaults if storage was mysteriously empty
  if (cats.length === 0) cats = DEFAULT_CATEGORIES;

  const updated = [...cats, category];
  saveLocal(STORAGE_KEYS.CATEGORIES, updated);
  return updated;
};

export const deleteCategory = async (categoryId: string) => {
  let cats = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  // Ensure we don't lose defaults if storage was mysteriously empty
  if (cats.length === 0) cats = DEFAULT_CATEGORIES;

  const updated = cats.filter(c => c.id !== categoryId);
  saveLocal(STORAGE_KEYS.CATEGORIES, updated);
  return updated;
};

export const addProject = async (project: Project) => {
  const projs = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
  const updated = [...projs, project];
  saveLocal(STORAGE_KEYS.PROJECTS, updated);
  return updated;
};

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  const projs = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
  const updated = projs.map(p => p.id === projectId ? { ...p, ...updates } : p);
  saveLocal(STORAGE_KEYS.PROJECTS, updated);
  return updated;
};

export const deleteProject = async (projectId: string) => {
  const projs = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
  const updated = projs.filter(p => p.id !== projectId);
  saveLocal(STORAGE_KEYS.PROJECTS, updated);
  return updated;
};

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
