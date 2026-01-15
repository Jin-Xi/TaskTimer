
import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Clock, Flag, Maximize2, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { Button } from './Button';
import { TRANSLATIONS } from '../constants';
import { formatTime } from '../utils/timeUtils';

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
      interval = setInterval(() => setElapsed(task.totalTime + (Date.now() - startTime)), 100);
    } else {
      setElapsed(task.totalTime);
    }
    return () => clearInterval(interval);
  }, [task]);

  const isRunning = task.status === TaskStatus.RUNNING;

  return (
    <div className={`group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border ${isRunning ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800'} p-5 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-0.5`}>
      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
        <div className={`h-full ${isRunning ? 'bg-indigo-500' : 'bg-slate-400'} transition-all duration-700`} style={{ width: isRunning ? '100%' : '0%' }} />
      </div>
      
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white truncate tracking-tight">{task.title}</h3>
            {isRunning && <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>}
          </div>
          {task.tags && task.tags.length > 0 && (
             <div className="flex flex-wrap gap-1 mt-1.5">
               {task.tags.map(tag => (
                 <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                   {tag}
                 </span>
               ))}
             </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onEnterFocusMode} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={`text-4xl font-mono font-black text-center tabular-nums py-2 ${isRunning ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
        {formatTime(elapsed)}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-50 dark:border-slate-800 pt-4 mt-auto">
        <div className="flex gap-2">
          <Button 
            variant={isRunning ? "secondary" : "primary"} 
            size="sm" 
            onClick={() => isRunning ? onPause(task.id) : onStart(task.id)} 
            className="w-12"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onComplete(task.id)} className="text-slate-400 hover:text-green-600 px-2" title="Mark as Complete">
            <CheckCircle2 className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onAddMilestone} className="text-slate-400 hover:text-indigo-600 px-2" title="Add Milestone">
          <Flag className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

interface TaskTimerProps {
  language: 'en' | 'zh';
  activeTasks: Task[];
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
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-sm border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center min-h-[180px] transition-all duration-300">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.noActiveTask}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 max-w-sm leading-relaxed">{t.selectTaskToStart}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className={`grid gap-5 ${
        activeTasks.length === 1 ? 'grid-cols-1' : 
        activeTasks.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
        'grid-cols-1 md:grid-cols-3'
      }`}>
        {activeTasks.map(task => (
          <div key={task.id} className="flex flex-col gap-3">
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
                className="flex gap-2 animate-in slide-in-from-top-2 bg-indigo-50 dark:bg-slate-800 p-3 rounded-xl border border-indigo-100 dark:border-slate-700 shadow-sm"
              >
                <input 
                  autoFocus 
                  placeholder={t.newMilestone} 
                  className="w-full bg-transparent outline-none text-sm text-slate-800 dark:text-white font-medium" 
                  value={milestoneTitle} 
                  onChange={(e) => setMilestoneTitle(e.target.value)} 
                />
                <Button type="submit" size="sm" className="py-1.5 px-3 text-xs">{t.add}</Button>
                <button type="button" onClick={() => setShowMilestoneInput(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 transition-colors uppercase">{t.cancel}</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
