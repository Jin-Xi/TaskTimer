
import { Task, Project, Language, ICSExportOptions } from '../types';
import { groupTasksByDate, groupTasksByProject, formatDateKey, formatMinutes } from './calendarUtils';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const generateICS = (
  tasks: Task[],
  projects: Project[],
  year: number,
  month: number,
  options: ICSExportOptions = {
    productName: 'ChronoFlow',
    timeZone: 'Asia/Shanghai',
    fileName: 'chronoflow-calendar.ics'
  }
): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ChronoFlow//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${options.productName}`,
    `X-WR-TIMEZONE:${options.timeZone}`,
    'X-WR-CALDESC:ChronoFlow 应用导出的任务时间记录',
  ];

  // 按日期和规划分组
  const grouped = groupTasksByDateAndProject(tasks, projects, year, month);

  grouped.forEach(({ date, project, durationMinutes, taskList }) => {
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    lines.push(
      'BEGIN:VEVENT',
      `UID:${generateUUID()}@chronoflow`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `SUMMARY:${project.name} (${formatMinutes(durationMinutes)})`,
      `DESCRIPTION:${taskList.map(t => t.title).join('\\n')}`,
      `LOCATION:ChronoFlow`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
};

export const downloadICSFile = (icsContent: string, fileName: string = 'chronoflow-calendar.ics') => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const groupTasksByDateAndProject = (
  tasks: Task[],
  projects: Project[],
  year: number,
  month: number
): Array<{
  date: string;
  project: Project;
  durationMinutes: number;
  taskList: Task[];
}> => {
  const result: Array<{
    date: string;
    project: Project;
    durationMinutes: number;
    taskList: Task[];
  }> = [];

  // 按日期分组
  const tasksByDate = groupTasksByDate(tasks, year, month);

  Object.entries(tasksByDate).forEach(([dateKey, dayTasks]) => {
    // 按规划分组
    const projectDurations = groupTasksByProject(dayTasks, projects);

    projectDurations.forEach(({ project, durationMinutes }) => {
      result.push({
        date: dateKey,
        project,
        durationMinutes,
        taskList: dayTasks.filter(t => t.projectId === project.id),
      });
    });
  });

  return result;
};

export const exportTasksToICS = (
  tasks: Task[],
  year: number,
  month: number,
  projects: Project[],
  language: Language
) => {
  const icsContent = generateICS(tasks, projects, year, month);
  const fileName = `chronoflow-${year}-${String(month + 1).padStart(2, '0')}.ics`;
  downloadICSFile(icsContent, fileName);
};
