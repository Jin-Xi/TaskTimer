import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Task, TaskStatus } from '../types';
import { TRANSLATIONS } from '../constants';

interface StatsProps {
  language: 'en' | 'zh';
  tasks: Task[];
}

export const Stats: React.FC<StatsProps> = ({ language, tasks }) => {
  const completedTasks = tasks.filter(t => t.totalTime > 0);
  const t = TRANSLATIONS[language];
  
  const categoryData = completedTasks.reduce((acc, task) => {
    const minutes = Math.round(task.totalTime / 1000 / 60);
    const tags = task.tags && task.tags.length > 0 ? task.tags : ['Uncategorized'];
    tags.forEach(tag => {
        const existing = acc.find(i => i.name === tag);
        if (existing) existing.value += minutes;
        else acc.push({ name: tag, value: minutes });
    });
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

  const COLORS = ['#6366f1', '#10b981', '#64748b', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'];
  const totalHours = (completedTasks.reduce((acc, t) => acc + t.totalTime, 0) / 1000 / 3600).toFixed(1);

  if (tasks.length === 0) return <div className="p-8 text-center text-slate-500">{language === 'zh' ? '暂无数据，请先追踪一些任务。' : 'Track some tasks to see analytics.'}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-500">
      <div className="col-span-1 lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.totalTime}</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{totalHours}h</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.tasksCompleted}</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.avgTaskTime}</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{completedTasks.length ? Math.round((completedTasks.reduce((a,b)=>a+b.totalTime,0)/1000/60)/completedTasks.length) : 0}m</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.mostActiveTag}</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-1 truncate">{categoryData[0]?.name || 'N/A'}</p>
        </div>
      </div>
      <div className="bg-white/90 dark:bg-slate-900/90 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold mb-4">{t.timeByTag}</h3>
        <div className="h-56"><ResponsiveContainer><BarChart data={categoryData} layout="vertical"><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11, fill: 'currentColor' }} /><Tooltip /><Bar dataKey="value" radius={[0, 4, 4, 0]}>{categoryData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div>
      </div>
      <div className="bg-white/90 dark:bg-slate-900/90 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-semibold mb-4">{t.taskDistribution}</h3>
        <div className="h-56"><ResponsiveContainer><PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">{categoryData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>
    </div>
  );
};