
import { io, Socket } from "socket.io-client";
import { Task, Category, Project, TaskStatus } from "../types";

const SERVER_URL = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;
const STORAGE_KEYS = {
  TASKS: 'chrono_tasks_v2',
  CATEGORIES: 'chrono_categories_v2',
  PROJECTS: 'chrono_projects_v2'
};

const minsAgo = (m: number) => Date.now() - (m * 60 * 1000);

const DEMO_DATA = {
  tasks: [
    {
      id: 'task-demo-standalone',
      title: '深度阅读：生产力手册',
      description: '分析 ChronoFlow 的核心交互逻辑。',
      tags: ['Creative', 'Study'],
      status: TaskStatus.COMPLETED,
      totalTime: 2700000,
      createdAt: minsAgo(120),
      logs: [{ start: minsAgo(105), end: minsAgo(60) }],
      milestones: [
        { id: 'm-s1', title: '完成前三章阅读', timestamp: minsAgo(90), branch: 'main' },
        { id: 'm-s2', title: '整理核心笔记', timestamp: minsAgo(65), branch: 'refine' }
      ],
      parentTaskIds: []
    },
    {
      id: 'task-p1',
      title: '需求分析与原型设计',
      tags: ['Work'],
      status: TaskStatus.COMPLETED,
      totalTime: 3600000,
      createdAt: minsAgo(500),
      logs: [{ start: minsAgo(480), end: minsAgo(420) }],
      milestones: [{ id: 'm-p1', title: '导出原型图', timestamp: minsAgo(425), branch: 'main' }],
      projectId: 'project-demo-1',
      parentTaskIds: []
    },
    {
      id: 'task-p2',
      title: '核心计时逻辑开发',
      tags: ['Work'],
      status: TaskStatus.COMPLETED,
      totalTime: 7200000,
      createdAt: minsAgo(400),
      logs: [{ start: minsAgo(380), end: minsAgo(260) }],
      milestones: [{ id: 'm-p2', title: 'Socket.IO 联调成功', timestamp: minsAgo(280), branch: 'main' }],
      projectId: 'project-demo-1',
      parentTaskIds: ['task-p1']
    },
    {
      id: 'task-p3',
      title: 'UI/UX 验收与部署',
      tags: ['Creative'],
      status: TaskStatus.IDLE,
      totalTime: 0,
      createdAt: minsAgo(200),
      logs: [],
      milestones: [],
      projectId: 'project-demo-1',
      parentTaskIds: ['task-p2']
    }
  ] as Task[],
  projects: [
    {
      id: 'project-demo-1',
      name: 'ChronoFlow 2.0 升级计划',
      description: '包含核心引擎重构与 AI 教练集成。',
      createdAt: minsAgo(600),
      color: 'violet'
    }
  ] as Project[]
};

let socket: Socket;

export const initSocket = () => {
    if (!socket && typeof window !== 'undefined') {
        socket = io(SERVER_URL, {
            reconnectionDelayMax: 10000,
            transports: ['websocket', 'polling'],
            autoConnect: false
        });
        
        socket.on('connect', () => console.log('Connected to sync server'));
    }
    return socket;
};

const getLocal = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  return JSON.parse(data);
};

const saveLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  // Use demo data if local storage is empty
  const localTasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  if (localTasks.length === 0) {
    callback(DEMO_DATA.tasks);
    saveLocal(STORAGE_KEYS.TASKS, DEMO_DATA.tasks);
  } else {
    callback(localTasks);
  }

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
  if (localProjs.length === 0) {
    callback(DEMO_DATA.projects);
    saveLocal(STORAGE_KEYS.PROJECTS, DEMO_DATA.projects);
  } else {
    callback(localProjs);
  }

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

export const deleteTasksByProjectId = async (projectId: string) => {
  const tasks = getLocal<Task[]>(STORAGE_KEYS.TASKS, []);
  const updated = tasks.filter(t => t.projectId !== projectId);
  saveLocal(STORAGE_KEYS.TASKS, updated);

  const s = initSocket();
  if (s?.connected) s.emit('updateData', { type: 'tasks', action: 'set', data: updated });
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

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  const projs = getLocal<Project[]>(STORAGE_KEYS.PROJECTS, []);
  const updated = projs.map(p => p.id === projectId ? { ...p, ...updates } : p);
  saveLocal(STORAGE_KEYS.PROJECTS, updated);

  const s = initSocket();
  if (s?.connected) s.emit('updateData', { type: 'projects', action: 'update', data: { id: projectId, ...updates } });
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
