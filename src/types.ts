
export enum TaskStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  BREAK = 'BREAK',
}

export type Language = 'zh-CN' | 'zh-TW';

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

export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface ProjectSchedule {
  type: 'daily' | 'weekly';
  days?: DayOfWeek[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  color: string;
  startDate?: string;
  endDate?: string;
  schedule?: ProjectSchedule;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  status: TaskStatus;
  totalTime: number;
  estimatedTime?: number; // Estimated duration in milliseconds
  createdAt: number;
  logs: TimeLog[];
  milestones: Milestone[];
  projectId?: string;
  parentTaskId: string | null; // 前置任务 ID，null 表示流水线起点
  isTerminal?: boolean; // 是否为终止节点
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

export enum AIMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: number;
  taskPreview?: TaskPreview[];
}

export interface TaskPreview {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes?: number;
  tag?: string;
  parentId: string | null; // 前置任务 ID，null 表示流水线起点
  isNew?: boolean;
}

export interface AIPlanningSession {
  id: string;
  projectId: string;
  mode: 'zero-state' | 'continuation';
  messages: AIMessage[];
  currentTasks: TaskPreview[];
  createdAt: number;
  updatedAt: number;
}

export interface ICSEvent {
  uid: string;
  startDate: Date;
  endDate: Date;
  summary: string;
  description: string;
  location?: string;
}

export interface ICSExportOptions {
  productName: string;
  timeZone: string;
  fileName: string;
}
