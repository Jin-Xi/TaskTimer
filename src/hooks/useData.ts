/**
 * Data Hooks
 *
 * React hooks that provide data access with automatic mode switching
 * between offline (localStorage) and cloud (API) modes.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task, Project, Category } from '../types';
import { getDataService } from '../services/dataService';
import { useAppMode } from './useAppMode';
import { DEFAULT_CATEGORIES } from '../constants';

// ============ useTasks Hook ============

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  deleteTasks: (ids: string[]) => Promise<number>;
}

export function useTasks(): UseTasksReturn {
  const { mode } = useAppMode();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => getDataService(mode), [mode]);

  // Subscribe to tasks
  useEffect(() => {
    setLoading(true);
    const unsubscribe = service.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [service]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await service.getTasks();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask = await service.createTask(task);
    // The subscription will update the tasks state
    return newTask;
  }, [service]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const updated = await service.updateTask(id, updates);
    return updated;
  }, [service]);

  const deleteTask = useCallback(async (id: string) => {
    const result = await service.deleteTask(id);
    return result;
  }, [service]);

  const deleteTasks = useCallback(async (ids: string[]) => {
    const count = await service.deleteTasks(ids);
    return count;
  }, [service]);

  return {
    tasks,
    loading,
    error,
    refresh,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
  };
}

// ============ useProjects Hook ============

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
}

export function useProjects(): UseProjectsReturn {
  const { mode } = useAppMode();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => getDataService(mode), [mode]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = service.subscribeToProjects((updatedProjects) => {
      setProjects(updatedProjects);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [service]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await service.getProjects();
      setProjects(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const addProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject = await service.createProject(project);
    return newProject;
  }, [service]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const updated = await service.updateProject(id, updates);
    return updated;
  }, [service]);

  const deleteProject = useCallback(async (id: string) => {
    const result = await service.deleteProject(id);
    return result;
  }, [service]);

  return {
    projects,
    loading,
    error,
    refresh,
    addProject,
    updateProject,
    deleteProject,
  };
}

// ============ useCategories Hook ============

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export function useCategories(): UseCategoriesReturn {
  const { mode, isOffline } = useAppMode();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service = useMemo(() => getDataService(mode), [mode]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = service.subscribeToCategories((updatedCategories) => {
      // In offline mode, ensure we always have default categories
      if (isOffline && updatedCategories.length === 0) {
        setCategories(DEFAULT_CATEGORIES);
      } else {
        setCategories(updatedCategories);
      }
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [service, isOffline]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await service.getCategories();
      if (isOffline && data.length === 0) {
        setCategories(DEFAULT_CATEGORIES);
      } else {
        setCategories(data);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [service, isOffline]);

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    const newCategory = await service.createCategory(category);
    return newCategory;
  }, [service]);

  const deleteCategory = useCallback(async (id: string) => {
    const result = await service.deleteCategory(id);
    return result;
  }, [service]);

  return {
    categories,
    loading,
    error,
    refresh,
    addCategory,
    deleteCategory,
  };
}

// Export types
export type { UseTasksReturn, UseProjectsReturn, UseCategoriesReturn };
