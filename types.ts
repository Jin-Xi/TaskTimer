
export enum TaskStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  BREAK = 'BREAK',
}

export interface TimeLog {
  start: number;
  end: number | null;
}

export interface Milestone {
  id: string;
  title: string;
  timestamp: number;
  branch: string;
  parentMilestoneId?: string | null;
  taskTime?: number; // Total task time elapsed at the moment this milestone was created
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  status: TaskStatus;
  totalTime: number;
  createdAt: number;
  logs: TimeLog[];
  milestones: Milestone[];
  projectId?: string;
  parentTaskIds: string[];
}

export interface AIAnalysisResult {
  summary: string;
  suggestions: string[];
  productivityScore: number;
}

export type AIProvider = 'gemini' | 'deepseek' | 'openai' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}
