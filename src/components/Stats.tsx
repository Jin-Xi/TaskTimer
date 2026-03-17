
import React, { useState } from 'react';
import { Task, Project, Language } from '../types';
import { CalendarView } from './CalendarView';
import { exportTasksToICS } from '../utils/icsGenerator';

interface StatsProps {
  language: Language;
  tasks: Task[];
  projects: Project[];
}

export const Stats: React.FC<StatsProps> = ({ language, tasks, projects }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleExportICS = () => {
    exportTasksToICS(tasks, currentYear, currentMonth, projects, language);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <CalendarView
        year={currentYear}
        month={currentMonth}
        tasks={tasks}
        projects={projects}
        onMonthChange={handleMonthChange}
        onExportICS={handleExportICS}
        language={language}
      />
    </div>
  );
};
