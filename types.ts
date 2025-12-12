export enum TaskStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

export interface TimeLog {
  start: number;
  end: number | null;
}

export interface Milestone {
  id: string;
  title: string;
  timestamp: number;
  branch: string; // e.g., 'main', 'feature', 'bugfix'
}

export interface Category {
  id: string;
  name: string;
  color: string; // e.g., 'indigo', 'emerald', 'rose'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  tags: string[]; // Replaces single category
  status: TaskStatus;
  totalTime: number; // In milliseconds
  createdAt: number;
  logs: TimeLog[];
  milestones: Milestone[];
}

export interface AIAnalysisResult {
  summary: string;
  suggestions: string[];
  productivityScore: number;
}