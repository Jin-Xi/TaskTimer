import { ChartColumn, LayoutDashboard, ListTodo, Zap } from 'lucide-react';

export const APP_NAME = "ChronoFlow";

export const NAV_ITEMS = [
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'dashboard', label: 'Analytics', icon: ChartColumn },
  { id: 'ai-insights', label: 'AI Insights', icon: Zap },
];

export const CATEGORIES = [
  'Development',
  'Design',
  'Meeting',
  'Research',
  'Planning',
  'Other'
];
