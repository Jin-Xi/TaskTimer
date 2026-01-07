
import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Clock, Flag, Maximize2, ChevronRight } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { Button } from './Button';
import { TRANSLATIONS } from '../constants';

interface SingleTimerProps {
  language: 'en' | 'zh';
  task: Task;
  onPause: (taskId: string) => void;
  onStart: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onAddMilestone: () => void;
  onEnterFocusMode: () => void;
}

const SingleTimer: React.FC<SingleTimerProps> = ({ 
  language, task, onPause, onStart, onComplete, onAddMilestone, onEnterFocusMode 
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: any;
    if (task.status === TaskStatus.RUNNING) {
      const currentLog = task.logs[task.logs.length - 1];
      const startTime = currentLog ? currentLog.start : Date.now();
      setElapsed(task.totalTime + (Date.now() - startTime));
      interval = setInterval(() => setElapsed(task.totalTime + (Date.now() - startTime)), 1000);
    } else {
      setElapsed(task.totalTime);
    }
    return () => clearInterval(interval);
  }, [task]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-800 p-4 flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-md">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: task.status === TaskStatus.RUNNING ? '100%' : '0%' }} />
      </div>
      
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{task.title}</h3>
          {task.tags && task.tags.length > 0 && (
             <div className="flex gap-1 mt-1">
               <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
                 {task.tags[0]}
               </span>
             </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEnterFocusMode} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white text-center tabular-nums py-1">
        {formatTime(elapsed)}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-50 dark:border-slate-800 pt-3">
        <div className="flex gap-1">
          <Button 
            variant={task.status === TaskStatus.RUNNING ? "secondary" : "primary"} 
            size="sm" 
            onClick={() => task.status === TaskStatus.RUNNING ? onPause(task.id) : onStart(task.id)} 
            className="px-3"
          >
            {task.status === TaskStatus.RUNNING ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onComplete(task.id)} className="text-slate-400 hover:text-red-500 px-2">
            <Square className="w-3.5 h-3.5" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onAddMilestone} className="text-indigo-600 dark:text-indigo-400 px-2">
          <Flag className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

interface TaskTimerProps {
  language: 'en' | 'zh';
  activeTasks: Task[]; // Changed from activeTask to activeTasks
  onStart: (taskId: string) => void;
  onPause: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onAddMilestone: (taskId: string, title: string, branch: string) => void;
  onEnterFocusMode?: (taskId: string) => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ 
  language, activeTasks, onStart, onPause, onComplete, onAddMilestone, onEnterFocusMode 
}) => {
  const [showMilestoneInput, setShowMilestoneInput] = useState<string | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  
  const t = TRANSLATIONS[language];

  const handleMilestoneSubmit = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (milestoneTitle.trim()) {
      onAddMilestone(taskId, milestoneTitle.trim(), 'main');
      setMilestoneTitle('');
      setShowMilestoneInput(null);
    }
  };

  if (activeTasks.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center h-44 transition-all duration-200">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.noActiveTask}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-xs">{t.selectTaskToStart}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className={`grid gap-4 ${
        activeTasks.length === 1 ? 'grid-cols-1' : 
        activeTasks.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
        'grid-cols-1 md:grid-cols-3'
      }`}>
        {activeTasks.map(task => (
          <div key={task.id} className="flex flex-col gap-2">
            <SingleTimer 
              language={language}
              task={task}
              onPause={onPause}
              onStart={onStart}
              onComplete={onComplete}
              onAddMilestone={() => setShowMilestoneInput(task.id)}
              onEnterFocusMode={() => onEnterFocusMode?.(task.id)}
            />
            {showMilestoneInput === task.id && (
              <form 
                onSubmit={(e) => handleMilestoneSubmit(task.id, e)} 
                className="flex gap-2 animate-in slide-in-from-top-2 bg-indigo-50 dark:bg-slate-800 p-2 rounded-lg border border-indigo-100 dark:border-slate-700"
              >
                <input 
                  autoFocus 
                  placeholder={t.newMilestone} 
                  className="w-full bg-transparent outline-none text-xs text-slate-800 dark:text-white" 
                  value={milestoneTitle} 
                  onChange={(e) => setMilestoneTitle(e.target.value)} 
                />
                <Button type="submit" size="sm" className="py-1 px-2 text-[10px]">{t.add}</Button>
                <button type="button" onClick={() => setShowMilestoneInput(null)} className="text-[10px] text-slate-400 hover:text-slate-600">{t.cancel}</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
