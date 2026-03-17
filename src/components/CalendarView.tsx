
import React, { useMemo } from 'react';
import { Button } from '@heroui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, Project, Language } from '../types';
import {
  generateCalendarGrid,
  groupTasksByDate,
  groupTasksByProject,
  formatDateKey,
  isSameDay,
  formatMinutes
} from '../utils/calendarUtils';

interface CalendarViewProps {
  year: number;
  month: number;
  tasks: Task[];
  projects: Project[];
  onMonthChange: (year: number, month: number) => void;
  onExportICS: () => void;
  language: Language;
}

const DayCell: React.FC<{
  date: Date;
  tasks: Task[];
  projects: Project[];
  isToday: boolean;
  language: Language;
}> = ({ date, tasks, projects, isToday, language }) => {
  const projectDurations = useMemo(() => {
    const grouped = groupTasksByProject(tasks, projects);
    return grouped
      .map(item => ({
        ...item,
        durationMinutes: Math.round(item.durationMinutes),
      }))
      .sort((a, b) => b.durationMinutes - a.durationMinutes);
  }, [tasks, projects]);

  const VISIBLE_LIMIT = 3;
  const visibleProjects = projectDurations.slice(0, VISIBLE_LIMIT);
  const hasOverflow = projectDurations.length > VISIBLE_LIMIT;

  const totalMinutes = projectDurations.reduce((sum, p) => sum + p.durationMinutes, 0);

  return (
    <div className={`
      min-h-[80px] p-2 rounded-xl border
      ${isToday ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-neutral-100 dark:border-neutral-800'}
    `}>
      <div className="text-sm font-bold mb-1">
        {date.getDate()}
      </div>

      <div className="space-y-1">
        {visibleProjects.map((item) => (
          <div
            key={item.project.id}
            className="text-xs px-2 py-1 rounded truncate"
            style={{
              backgroundColor: item.project.color,
              opacity: 1,
              color: 'white',
            }}
          >
            {item.project.name} {formatMinutes(item.durationMinutes)}
          </div>
        ))}

        {projectDurations.slice(VISIBLE_LIMIT).map((item) => (
          <div
            key={item.project.id}
            className="text-xs px-2 py-1 rounded truncate"
            style={{
              backgroundColor: item.project.color,
              opacity: 0.3,
              color: 'white',
            }}
          >
            {item.project.name} {formatMinutes(item.durationMinutes)}
          </div>
        ))}

        {hasOverflow && (
          <div className="text-xs text-neutral-400 text-center">
            +{projectDurations.length - VISIBLE_LIMIT} {language === 'zh-TW' ? '更多' : '更多'}
          </div>
        )}

        <div className="text-xs text-neutral-500 text-right">
          {language === 'zh-TW' ? '總計' : '总计'}: {formatMinutes(totalMinutes)}
        </div>
      </div>
    </div>
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  year,
  month,
  tasks,
  projects,
  onMonthChange,
  onExportICS,
  language
}) => {
  const calendarDays = useMemo(() => {
    return generateCalendarGrid(year, month);
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    return groupTasksByDate(tasks, year, month);
  }, [tasks, year, month]);

  const handlePrevMonth = () => {
    const date = new Date(year, month - 1, 1);
    onMonthChange(date.getFullYear(), date.getMonth());
  };

  const handleNextMonth = () => {
    const date = new Date(year, month + 1, 1);
    onMonthChange(date.getFullYear(), date.getMonth());
  };

  return (
    <div className="w-full">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {year}年{month + 1}月
        </h2>
        <div className="flex gap-2">
          <Button onClick={onExportICS} variant="flat" size="sm">
            📥 {language === 'zh-TW' ? '导出 ICS' : '导出 ICS'}
          </Button>
          <Button isIconOnly onClick={handlePrevMonth} size="sm" variant="flat">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button isIconOnly onClick={handleNextMonth} size="sm" variant="flat">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div key={day} className="text-center text-sm font-bold text-neutral-400">
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => (
          <DayCell
            key={day.toISOString()}
            date={day}
            tasks={tasksByDate[formatDateKey(day)] || []}
            projects={projects}
            isToday={isSameDay(day, new Date())}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};
