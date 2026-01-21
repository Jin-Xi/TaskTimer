
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Task, TaskStatus } from '../types';
import { TRANSLATIONS } from '../constants';

interface StatsProps {
  language: 'en' | 'zh';
  tasks: Task[];
}

export const Stats: React.FC<StatsProps> = ({ language, tasks }) => {
  const t = TRANSLATIONS[language];
  const completedTasks = tasks.filter(t => t.totalTime > 0);

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const weeklyDurationData = completedTasks
    .map(task => {
      const weeklyMinutes = task.logs.reduce((acc, log) => {
        const start = Math.max(log.start, weekAgo);
        const end = log.end || now;
        if (end > weekAgo) {
          return acc + Math.max(0, end - start);
        }
        return acc;
      }, 0);
      return {
        name: task.title,
        duration: Math.round(weeklyMinutes / 1000 / 60),
      };
    })
    .filter(d => d.duration > 0)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 8);

  const totalDurationData = completedTasks
    .map(task => ({
      name: task.title,
      duration: Math.round(task.totalTime / 1000 / 60),
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 8);

  const categoryData = completedTasks.reduce((acc, task) => {
    const minutes = Math.round(task.totalTime / 1000 / 60);
    const tags = task.tags && task.tags.length > 0 ? task.tags : ['Uncategorized'];
    tags.forEach(tag => {
      const existing = acc.find(i => i.name === tag);
      if (existing) existing.value += minutes;
      else acc.push({ name: tag, value: minutes });
    });
    return acc;
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#6366f1', '#10b981', '#64748b', '#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'];
  const totalHours = (completedTasks.reduce((acc, t) => acc + t.totalTime, 0) / 1000 / 3600).toFixed(1);

  if (completedTasks.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-10 animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3.5rem] p-12 md:p-20 text-center shadow-sm flex flex-col items-center max-w-lg">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-8">
            <span className="text-4xl grayscale opacity-50">📊</span>
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">
             {language === 'zh' ? '暂无数据' : 'No Data Yet'}
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            {language === 'zh' ? '请先完成一些任务，统计数据将在此显示。' : 'Complete some tasks to see your productivity metrics here.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700 px-2 pb-20">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_20px_80px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.3)] rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 flex flex-col gap-6">
        
        <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
           <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.analytics}
              </h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">
                {language === 'zh' ? '专注效率统计' : 'Focus Metrics'}
              </p>
           </div>
           <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.totalTime}</p>
                <p className="text-2xl font-black text-indigo-600 tracking-tight">{totalHours}h</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.tasksCompleted}</p>
                <p className="text-2xl font-black text-emerald-600 tracking-tight">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/50">
            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-2">{t.avgTaskTime}</p>
            <p className="text-xl font-black text-slate-700 dark:text-slate-200 tabular-nums">
              {completedTasks.length ? Math.round((completedTasks.reduce((a, b) => a + b.totalTime, 0) / 1000 / 60) / completedTasks.length) : 0}m
            </p>
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/50">
            <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-2">{t.mostActiveTag}</p>
            <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">{categoryData[0]?.name || 'N/A'}</p>
          </div>
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-3xl border border-indigo-100/50 dark:border-indigo-900/30">
            <p className="text-[8px] text-indigo-500/70 uppercase font-black tracking-widest mb-2">Weekly Focus</p>
            <p className="text-xl font-black text-indigo-600">{(weeklyDurationData.reduce((a,b) => a + b.duration, 0) / 60).toFixed(1)}h</p>
          </div>
           <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/30">
            <p className="text-[8px] text-emerald-500/70 uppercase font-black tracking-widest mb-2">Weekly Goals</p>
            <p className="text-xl font-black text-emerald-600">{completedTasks.filter(t => t.logs.some(l => l.start > weekAgo)).length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-50/30 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-4 bg-indigo-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{t.weeklyDist}</h3>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyDurationData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={90} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '0.75rem', fontSize: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="duration" radius={[0, 4, 4, 0]} barSize={12}>
                    {weeklyDurationData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.9} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50/30 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-4 bg-emerald-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{t.totalDist}</h3>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalDurationData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={90} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '0.75rem', fontSize: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="duration" radius={[0, 4, 4, 0]} barSize={12}>
                    {totalDurationData.map((e, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} fillOpacity={0.9} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/30 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50">
           <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-4 bg-rose-500 rounded-full" />
              <h3 className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{t.timeByTag}</h3>
           </div>
           <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '0.75rem', fontSize: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                    {categoryData.map((e, i) => <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
};
