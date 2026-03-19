/**
 * Data Service Abstraction Layer
 *
 * Provides a unified interface for data operations using localStorage.
 * (Cloud mode has been removed - app is offline-only now)
 */
import type { Task, Project, Category, AIAnalysisResult, TaskPreview } from '../types';

// ============ Service Interface ============

export interface DataService {
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  deleteTasks(ids: string[]): Promise<number>;

  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | null>;
  createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, 'id'>): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;

  // Data
  exportData(): Promise<{ tasks: Task[]; projects: Project[]; categories: Category[] }>;
  importData(data: { tasks?: Task[]; projects?: Project[]; categories?: Category[] }): Promise<{ imported: number; errors: string[] }>;

  // AI
  analyzeProductivity(taskIds?: string[]): Promise<AIAnalysisResult>;
  generateProjectPlan(goal: string, context?: string): Promise<{ projectName: string; tasks: TaskPreview[] }>;

  // Subscriptions
  subscribeToTasks(callback: (tasks: Task[]) => void): () => void;
  subscribeToProjects(callback: (projects: Project[]) => void): () => void;
  subscribeToCategories(callback: (categories: Category[]) => void): () => void;
}

// ============ LocalStorage Implementation ============

const STORAGE_KEYS = {
  TASKS: 'chrono_tasks',
  PROJECTS: 'chrono_projects',
  CATEGORIES: 'chrono_categories',
};

// Event names for localStorage changes
const STORAGE_EVENTS = {
  TASKS_CHANGED: 'chrono_tasks_changed',
  PROJECTS_CHANGED: 'chrono_projects_changed',
  CATEGORIES_CHANGED: 'chrono_categories_changed',
};

class LocalStorageDataService implements DataService {
  private taskListeners: Set<(tasks: Task[]) => void> = new Set();
  private projectListeners: Set<(projects: Project[]) => void> = new Set();
  private categoryListeners: Set<(categories: Category[]) => void> = new Set();

  constructor() {
    // Listen for storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEYS.TASKS) {
        this.notifyTasksChanged();
      } else if (e.key === STORAGE_KEYS.PROJECTS) {
        this.notifyProjectsChanged();
      } else if (e.key === STORAGE_KEYS.CATEGORIES) {
        this.notifyCategoriesChanged();
      }
    });
  }

  private notifyTasksChanged() {
    const tasks = this.getTasksSync();
    this.taskListeners.forEach(cb => cb(tasks));
  }

  private notifyProjectsChanged() {
    const projects = this.getProjectsSync();
    this.projectListeners.forEach(cb => cb(projects));
  }

  private notifyCategoriesChanged() {
    const categories = this.getCategoriesSync();
    this.categoryListeners.forEach(cb => cb(categories));
  }

  private getTasksSync(): Task[] {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  }

  private getProjectsSync(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  }

  private getCategoriesSync(): Category[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return this.getTasksSync();
  }

  async getTask(id: string): Promise<Task | null> {
    const tasks = this.getTasksSync();
    return tasks.find(t => t.id === id) || null;
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const tasks = this.getTasksSync();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    } as Task;
    tasks.push(newTask);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.notifyTasksChanged();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const tasks = this.getTasksSync();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.notifyTasksChanged();
    return tasks[index];
  }

  async deleteTask(id: string): Promise<boolean> {
    const tasks = this.getTasksSync();
    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return false;

    const parentTaskId = taskToDelete.parentTaskId;

    // 更新所有以该任务为父任务的子任务，将它们的父任务指向被删除任务的父任务
    // 这样可以保持流水线的链表结构
    const updated = tasks
      .filter(t => t.id !== id)
      .map(t => {
        if (t.parentTaskId === id) {
          return { ...t, parentTaskId };
        }
        return t;
      });

    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updated));
    this.notifyTasksChanged();
    return true;
  }

  async deleteTasks(ids: string[]): Promise<number> {
    const tasks = this.getTasksSync();
    const initialLength = tasks.length;
    const remaining = tasks.filter(t => !ids.includes(t.id));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(remaining));
    this.notifyTasksChanged();
    return initialLength - remaining.length;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.getProjectsSync();
  }

  async getProject(id: string): Promise<Project | null> {
    const projects = this.getProjectsSync();
    return projects.find(p => p.id === id) || null;
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const projects = this.getProjectsSync();
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    } as Project;
    projects.push(newProject);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    this.notifyProjectsChanged();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const projects = this.getProjectsSync();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    projects[index] = { ...projects[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    this.notifyProjectsChanged();
    return projects[index];
  }

  async deleteProject(id: string): Promise<boolean> {
    const projects = this.getProjectsSync();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return false;
    projects.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    this.notifyProjectsChanged();
    return true;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.getCategoriesSync();
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const categories = this.getCategoriesSync();
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    categories.push(newCategory);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notifyCategoriesChanged();
    return newCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const categories = this.getCategoriesSync();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    categories.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.notifyCategoriesChanged();
    return true;
  }

  // Data
  async exportData(): Promise<{ tasks: Task[]; projects: Project[]; categories: Category[] }> {
    return {
      tasks: this.getTasksSync(),
      projects: this.getProjectsSync(),
      categories: this.getCategoriesSync(),
    };
  }

  async importData(data: { tasks?: Task[]; projects?: Project[]; categories?: Category[] }): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    if (data.categories) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
      imported += data.categories.length;
      this.notifyCategoriesChanged();
    }

    if (data.projects) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
      imported += data.projects.length;
      this.notifyProjectsChanged();
    }

    if (data.tasks) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
      imported += data.tasks.length;
      this.notifyTasksChanged();
    }

    return { imported, errors };
  }

  // AI (uses existing aiService for offline mode)
  async analyzeProductivity(taskIds?: string[]): Promise<AIAnalysisResult> {
    // This will be handled by the existing AI service in offline mode
    // The data service just provides the interface
    throw new Error('AI analysis in offline mode should use the existing aiService');
  }

  async generateProjectPlan(goal: string, context?: string): Promise<{ projectName: string; tasks: TaskPreview[] }> {
    // This will be handled by the existing AI service in offline mode
    throw new Error('AI planning in offline mode should use the existing aiService');
  }

  // Subscriptions
  subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
    this.taskListeners.add(callback);
    // Immediately call with current data
    callback(this.getTasksSync());
    return () => {
      this.taskListeners.delete(callback);
    };
  }

  subscribeToProjects(callback: (projects: Project[]) => void): () => void {
    this.projectListeners.add(callback);
    callback(this.getProjectsSync());
    return () => {
      this.projectListeners.delete(callback);
    };
  }

  subscribeToCategories(callback: (categories: Category[]) => void): () => void {
    this.categoryListeners.add(callback);
    callback(this.getCategoriesSync());
    return () => {
      this.categoryListeners.delete(callback);
    };
  }
}

// ============ Service Factory ============

// Singleton instance (offline mode only now)
let currentService: DataService | null = null;

export function getDataService(_mode?: 'offline' | 'cloud'): DataService {
  if (!currentService) {
    currentService = new LocalStorageDataService();
  }
  return currentService;
}

// Export singleton instance for direct use
export const localStorageDataService = new LocalStorageDataService();
