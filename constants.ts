import { ChartColumn, LayoutDashboard, ListTodo, Zap } from 'lucide-react';
import { Category } from './types';

export const APP_NAME = "ChronoFlow";

export const NAV_ITEMS = [
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'dashboard', label: 'Analytics', icon: ChartColumn },
  { id: 'ai-insights', label: 'AI Insights', icon: Zap },
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Study', color: 'indigo' },
  { id: 'c2', name: 'Exercise', color: 'emerald' },
  { id: 'c3', name: 'Work', color: 'slate' },
  { id: 'c4', name: 'Creative', color: 'rose' }
];

export const TAG_COLORS = [
  'indigo', 'emerald', 'slate', 'rose', 'amber', 'cyan', 'violet', 'fuchsia'
];