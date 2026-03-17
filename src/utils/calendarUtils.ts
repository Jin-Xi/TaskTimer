
import { Task, Project } from '../types';

export const generateCalendarGrid = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: Date[] = [];

  // 填充月初空白
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(new Date(year, month, 1 - startDayOfWeek + i));
  }

  // 填充月份日期
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // 填充月末空白以完成 42 格 (6 行 × 7 列)
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

export const groupTasksByDate = (
  tasks: Task[],
  year: number,
  month: number
): Record<string, Task[]> => {
  const grouped: Record<string, Task[]> = {};

  tasks.forEach(task => {
    task.logs.forEach(log => {
      const date = new Date(log.start);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const key = formatDateKey(date);
        if (!grouped[key]) {
          grouped[key] = [];
        }
        if (!grouped[key].includes(task)) {
          grouped[key].push(task);
        }
      }
    });
  });

  return grouped;
};

export const groupTasksByProject = (
  tasks: Task[],
  projects: Project[]
): Array<{ project: Project; durationMinutes: number }> => {
  const projectMap = new Map<string, number>();

  tasks.forEach(task => {
    const duration = task.totalTime;
    const projectId = task.projectId;

    if (projectId) {
      const current = projectMap.get(projectId) || 0;
      projectMap.set(projectId, current + duration);
    }
  });

  return Array.from(projectMap.entries())
    .filter(([id]) => projects.some(p => p.id === id))
    .map(([projectId, durationMs]) => ({
      project: projects.find(p => p.id === projectId)!,
      durationMinutes: durationMs / 1000 / 60,
    }));
};

export const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
};
