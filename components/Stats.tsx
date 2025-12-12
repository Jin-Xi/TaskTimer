import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Task, TaskStatus } from '../types';

interface StatsProps {
  tasks: Task[];
}

export const Stats: React.FC<StatsProps> = ({ tasks }) => {
  const completedTasks = tasks.filter(t => t.totalTime > 0);
  
  // Aggregate by Category
  const categoryData = completedTasks.reduce((acc, task) => {
    const existing = acc.find(i => i.name === task.category);
    const minutes = Math.round(task.totalTime / 1000 / 60);
    if (existing) {
      existing.value += minutes;
    } else {
      acc.push({ name: task.category, value: minutes });
    }
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#64748b'];

  const totalTime = completedTasks.reduce((acc, t) => acc + t.totalTime, 0);
  const totalHours = (totalTime / 1000 / 3600).toFixed(1);

  if (tasks.length === 0) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Track some tasks to see analytics.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="col-span-1 lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3 mb-1">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Total Time</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{totalHours}h</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Tasks Completed</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}</p>
        </div>
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Avg Task Time</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {completedTasks.length ? Math.round((totalTime / 1000 / 60) / completedTasks.length) : 0}m
          </p>
        </div>
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Most Active</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-200 truncate mt-1">
             {categoryData[0]?.name || 'N/A'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Time by Category (Minutes)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.7 }} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', color: '#1e293b' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Task Distribution</h3>
        <div className="h-56">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#fff', color: '#1e293b' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {categoryData.map((entry, index) => (
            <div key={entry.name} className="flex items-center text-[10px] text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              {entry.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};