import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Clock, Flag, GitBranch, Maximize2 } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { Button } from './Button';
import { TRANSLATIONS } from '../constants';

interface TaskTimerProps {
  language: 'en' | 'zh';
  activeTask: Task | null;
  onStart: (taskId: string) => void;
  onPause: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onAddMilestone: (taskId: string, title: string, branch: string) => void;
  onEnterFocusMode?: () => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ language, activeTask, onStart, onPause, onComplete, onAddMilestone, onEnterFocusMode }) => {
  const [elapsed, setElapsed] = useState(0);
  const [showMilestoneInput, setShowMilestoneInput] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneBranch, setMilestoneBranch] = useState('main');

  const t = TRANSLATIONS[language];

  useEffect(() => {
    let interval: any;
    if (activeTask && activeTask.status === TaskStatus.RUNNING) {
      const currentLog = activeTask.logs[activeTask.logs.length - 1];
      const startTime = currentLog ? currentLog.start : Date.now();
      setElapsed(activeTask.totalTime + (Date.now() - startTime));
      interval = setInterval(() => setElapsed(activeTask.totalTime + (Date.now() - startTime)), 1000);
    } else if (activeTask) {
      setElapsed(activeTask.totalTime);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeTask]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTask && milestoneTitle.trim()) {
      onAddMilestone(activeTask.id, milestoneTitle.trim(), milestoneBranch.trim() || 'main');
      setMilestoneTitle('');
      setShowMilestoneInput(false);
    }
  };

  if (!activeTask) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center h-40 transition-colors duration-200">
        <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-3" />
        <h3 className="text-base font-medium text-slate-900 dark:text-white">{t.noActiveTask}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{t.selectTaskToStart}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-sm border border-indigo-100 dark:border-slate-800 p-5 relative overflow-hidden flex flex-col gap-5 transition-colors duration-200">
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100 dark:bg-slate-800">
        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: activeTask.status === TaskStatus.RUNNING ? '100%' : '0%' }} />
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate max-w-md">{activeTask.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 truncate max-w-md">{activeTask.description || ""}</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-4xl md:text-5xl font-mono font-bold text-slate-900 dark:text-white mb-3 tabular-nums">{formatTime(elapsed)}</div>
          <div className="flex items-center gap-2">
            <Button variant={activeTask.status === TaskStatus.RUNNING ? "secondary" : "primary"} size="sm" onClick={() => activeTask.status === TaskStatus.RUNNING ? onPause(activeTask.id) : onStart(activeTask.id)} className="w-24">
               {activeTask.status === TaskStatus.RUNNING ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
               {activeTask.status === TaskStatus.RUNNING ? (language === 'zh' ? '暂停' : 'Pause') : (language === 'zh' ? '继续' : 'Resume')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onComplete(activeTask.id)} className="text-slate-500 px-2" title="Complete"><Square className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setShowMilestoneInput(true)} className="text-indigo-600 px-2" title="Milestone"><Flag className="w-4 h-4" /></Button>
            {onEnterFocusMode && <Button variant="ghost" size="sm" onClick={onEnterFocusMode} className="text-slate-500 px-2"><Maximize2 className="w-4 h-4" /></Button>}
          </div>
        </div>
      </div>

      {showMilestoneInput && (
        <form onSubmit={handleMilestoneSubmit} className="flex gap-2 animate-in fade-in slide-in-from-top-2 bg-indigo-50 dark:bg-slate-800 p-2.5 rounded-lg border border-indigo-100">
           <input autoFocus placeholder={t.newMilestone} className="w-full bg-transparent outline-none text-sm text-slate-800 dark:text-white" value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} />
           <div className="flex items-center gap-2">
             <Button type="submit" size="sm">{t.add}</Button>
             <button type="button" onClick={() => setShowMilestoneInput(false)} className="text-xs text-slate-500">{t.cancel}</button>
           </div>
        </form>
      )}
    </div>
  );
};