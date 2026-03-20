/**
 * Data Service Abstraction Layer
 *
 * Provides a unified interface for data operations that works
 * with both offline (localStorage) and cloud (API) modes.
 */
import type { Task, Project, Category, AIAnalysisResult, TaskPreview } from '../types';
import { apiClient } from './apiClient';

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

    // Update child tasks to point to the deleted task's parent
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

// ============ API Implementation ============

class APIDataService implements DataService {
  // Tasks
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get<{ tasks: any[] }>('/tasks');
    return response.tasks.map(this.transformTaskFromAPI);
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      const task = await apiClient.get<any>(`/tasks/${id}`);
      return this.transformTaskFromAPI(task);
    } catch {
      return null;
    }
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const response = await apiClient.post<any>('/tasks', this.transformTaskToAPI(task));
    return this.transformTaskFromAPI(response);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const response = await apiClient.put<any>(`/tasks/${id}`, this.transformTaskToAPI(updates));
      return this.transformTaskFromAPI(response);
    } catch {
      return null;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/tasks/${id}`);
      return true;
    } catch {
      return false;
    }
  }

  async deleteTasks(ids: string[]): Promise<number> {
    const response = await apiClient.delete<{ deleted_count: number }>(`/tasks?task_ids=${ids.join(',')}`);
    return response.deleted_count;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const projects = await apiClient.get<any[]>('/projects');
    return projects.map(this.transformProjectFromAPI);
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const project = await apiClient.get<any>(`/projects/${id}`);
      return this.transformProjectFromAPI(project);
    } catch {
      return null;
    }
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const response = await apiClient.post<any>('/projects', this.transformProjectToAPI(project));
    return this.transformProjectFromAPI(response);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const response = await apiClient.put<any>(`/projects/${id}`, this.transformProjectToAPI(updates));
      return this.transformProjectFromAPI(response);
    } catch {
      return null;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/projects/${id}`);
      return true;
    } catch {
      return false;
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categories = await apiClient.get<any[]>('/categories');
    return categories.map(this.transformCategoryFromAPI);
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await apiClient.post<any>('/categories', category);
    return this.transformCategoryFromAPI(response);
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/categories/${id}`);
      return true;
    } catch {
      return false;
    }
  }

  // Data
  async exportData(): Promise<{ tasks: Task[]; projects: Project[]; categories: Category[] }> {
    const data = await apiClient.get<{
      tasks: any[];
      projects: any[];
      categories: any[];
    }>('/data/export');
    return {
      tasks: data.tasks.map(this.transformTaskFromAPI),
      projects: data.projects.map(this.transformProjectFromAPI),
      categories: data.categories.map(this.transformCategoryFromAPI),
    };
  }

  async importData(data: { tasks?: Task[]; projects?: Project[]; categories?: Category[] }): Promise<{ imported: number; errors: string[] }> {
    const response = await apiClient.post<{
      tasks_imported: number;
      projects_imported: number;
      categories_imported: number;
      errors: string[];
    }>('/data/import', {
      tasks: data.tasks?.map(this.transformTaskToAPI),
      projects: data.projects?.map(this.transformProjectToAPI),
      categories: data.categories,
    });

    return {
      imported: response.tasks_imported + response.projects_imported + response.categories_imported,
      errors: response.errors,
    };
  }

  // AI
  async analyzeProductivity(taskIds?: string[]): Promise<AIAnalysisResult> {
    const response = await apiClient.post<{
      score: number;
      summary: string;
      suggestions: string[];
    }>('/ai/analyze', { task_ids: taskIds });

    return {
      productivityScore: response.score,
      summary: response.summary,
      suggestions: response.suggestions,
    };
  }

  async generateProjectPlan(goal: string, context?: string): Promise<{ projectName: string; tasks: TaskPreview[] }> {
    const response = await apiClient.post<{
      project_name: string;
      tasks: Array<{
        title: string;
        description?: string;
        estimated_time?: number;
        dependencies?: string[];
      }>;
    }>('/ai/plan', { goal, context });

    return {
      projectName: response.project_name,
      tasks: response.tasks.map(t => ({
        id: crypto.randomUUID(),
        title: t.title,
        description: t.description,
        estimatedMinutes: t.estimated_time,
        parentId: null,
        tag: undefined,
        isNew: true,
      })),
    };
  }

  // Subscriptions (polling-based for now, WebSocket can be added later)
  subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
    // Initial fetch
    this.getTasks().then(callback);

    // Poll for updates (every 30 seconds)
    const intervalId = setInterval(() => {
      this.getTasks().then(callback);
    }, 30000);

    return () => clearInterval(intervalId);
  }

  subscribeToProjects(callback: (projects: Project[]) => void): () => void {
    this.getProjects().then(callback);
    const intervalId = setInterval(() => {
      this.getProjects().then(callback);
    }, 30000);
    return () => clearInterval(intervalId);
  }

  subscribeToCategories(callback: (categories: Category[]) => void): () => void {
    this.getCategories().then(callback);
    const intervalId = setInterval(() => {
      this.getCategories().then(callback);
    }, 30000);
    return () => clearInterval(intervalId);
  }

  // Transform helpers
  private transformTaskFromAPI(apiTask: any): Task {
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      tags: apiTask.tags || [],
      status: apiTask.status,
      totalTime: apiTask.total_time,
      estimatedTime: apiTask.estimated_time,
      createdAt: new Date(apiTask.created_at).getTime(),
      logs: (apiTask.time_logs || []).map((log: any) => ({
        start: log.start_time,
        end: log.end_time,
      })),
      milestones: (apiTask.milestones || []).map((m: any) => ({
        id: m.id,
        title: m.name,
        timestamp: new Date(m.created_at).getTime(),
        branch: m.branch_name || 'main',
        taskTime: m.task_time,
      })),
      projectId: apiTask.project_id,
      parentTaskId: apiTask.parent_task_id || null,
      isTerminal: apiTask.is_terminal,
    };
  }

  private transformTaskToAPI(task: Partial<Task>): any {
    return {
      title: task.title,
      description: task.description,
      tags: task.tags,
      status: task.status,
      total_time: task.totalTime,
      estimated_time: task.estimatedTime,
      project_id: task.projectId,
      parent_task_id: task.parentTaskId,
      is_terminal: task.isTerminal,
    };
  }

  private transformProjectFromAPI(apiProject: any): Project {
    return {
      id: apiProject.id,
      name: apiProject.name,
      description: apiProject.description,
      createdAt: new Date(apiProject.created_at).getTime(),
      color: apiProject.color,
      startDate: apiProject.start_date,
      endDate: apiProject.end_date,
    };
  }

  private transformProjectToAPI(project: Partial<Project>): any {
    return {
      name: project.name,
      description: project.description,
      color: project.color,
      start_date: project.startDate,
      end_date: project.endDate,
    };
  }

  private transformCategoryFromAPI(apiCategory: any): Category {
    return {
      id: apiCategory.id,
      name: apiCategory.name,
      color: apiCategory.color,
    };
  }
}

// ============ Service Factory ============

let currentService: DataService | null = null;
let currentMode: 'offline' | 'cloud' | null = null;

export function getDataService(mode: 'offline' | 'cloud'): DataService {
  // Create new service if mode changed or no service exists
  if (!currentService || currentMode !== mode) {
    currentService = mode === 'offline' ? new LocalStorageDataService() : new APIDataService();
    currentMode = mode;
  }
  return currentService;
}

// Export singleton instances for direct use
export const localStorageDataService = new LocalStorageDataService();
export const apiDataService = new APIDataService();
