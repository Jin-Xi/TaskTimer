import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Clock, Flag, GitBranch, Maximize2 } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { Button } from './Button';

interface TaskTimerProps {
  activeTask: Task | null;
  onStart: (taskId: string) => void;
  onPause: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onAddMilestone: (taskId: string, title: string, branch: string) => void;
  onEnterFocusMode?: () => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ activeTask, onStart, onPause, onComplete, onAddMilestone, onEnterFocusMode }) => {
  const [elapsed, setElapsed] = useState(0);
  const [showMilestoneInput, setShowMilestoneInput] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneBranch, setMilestoneBranch] = useState('main');

  useEffect(() => {
    let interval: any;

    if (activeTask && activeTask.status === TaskStatus.RUNNING) {
      const currentLog = activeTask.logs[activeTask.logs.length - 1];
      const startTime = currentLog ? currentLog.start : Date.now();
      
      setElapsed(activeTask.totalTime + (Date.now() - startTime));

      interval = setInterval(() => {
        setElapsed(activeTask.totalTime + (Date.now() - startTime));
      }, 1000);
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
      setMilestoneBranch('main');
      setShowMilestoneInput(false);
    }
  };

  if (!activeTask) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center h-40 transition-colors duration-200">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-full mb-3">
          <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-base font-medium text-slate-900 dark:text-white">No active task</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Select a task from the list to start timing.</p>
      </div>
    );
  }

  const recentMilestones = activeTask.milestones 
    ? [...activeTask.milestones].reverse().slice(0, 3) 
    : [];

  const tags = activeTask.tags || [];

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-sm border border-indigo-100 dark:border-slate-800 p-5 relative overflow-hidden flex flex-col gap-5 transition-colors duration-200">
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100 dark:bg-slate-800">
        <div 
          className="h-full bg-indigo-500 transition-all duration-1000" 
          style={{ width: activeTask.status === TaskStatus.RUNNING ? '100%' : '0%' }}
        />
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap justify-center md:justify-start gap-1 mb-1.5">
             {tags.map(tag => (
                 <span key={tag} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold rounded uppercase tracking-wide">
                    {tag}
                 </span>
             ))}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate max-w-md" title={activeTask.title}>
            {activeTask.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 truncate max-w-md">
            {activeTask.description || "No description provided"}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-4xl md:text-5xl font-mono font-bold text-slate-900 dark:text-white tracking-tight mb-3 tabular-nums">
            {formatTime(elapsed)}
          </div>
          
          <div className="flex items-center gap-2">
            {activeTask.status === TaskStatus.RUNNING ? (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => onPause(activeTask.id)}
                className="w-24"
              >
                <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => onStart(activeTask.id)}
                className="w-24"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" /> Resume
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onComplete(activeTask.id)}
              className="text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 px-2"
              title="Complete Task"
            >
              <Square className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

             <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowMilestoneInput(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2"
              title="Add Milestone"
            >
              <Flag className="w-4 h-4" />
            </Button>

            {onEnterFocusMode && (
               <Button
                variant="ghost"
                size="sm"
                onClick={onEnterFocusMode}
                className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2"
                title="Enter Focus Mode"
               >
                 <Maximize2 className="w-4 h-4" />
               </Button>
            )}
          </div>
        </div>
      </div>

      {showMilestoneInput && (
        <form onSubmit={handleMilestoneSubmit} className="flex flex-col sm:flex-row gap-2 animate-in fade-in slide-in-from-top-2 bg-indigo-50 dark:bg-slate-800 p-2.5 rounded-lg border border-indigo-100 dark:border-slate-700">
           <div className="flex items-center flex-1 gap-2">
               <Flag className="w-4 h-4 text-indigo-400" />
               <input 
                  autoFocus
                  type="text" 
                  placeholder="Milestone name..." 
                  className="w-full bg-transparent border-b border-indigo-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none px-1 py-1 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
               />
           </div>
           
           <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-md border border-indigo-200 dark:border-slate-600 px-2 py-1">
                <GitBranch className="w-3 h-3 text-slate-400" />
                <input
                    type="text"
                    placeholder="Branch"
                    className="w-16 text-xs outline-none bg-transparent text-slate-800 dark:text-slate-200"
                    value={milestoneBranch}
                    onChange={(e) => setMilestoneBranch(e.target.value)}
                />
             </div>
             
             <button type="submit" className="text-xs font-medium text-white bg-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-700">Add</button>
             <button type="button" onClick={() => setShowMilestoneInput(false)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2">Cancel</button>
           </div>
        </form>
      )}

      {!showMilestoneInput && recentMilestones.length > 0 && (
         <div className="flex gap-4 border-t border-slate-100 dark:border-slate-800 pt-2.5 overflow-hidden">
            {recentMilestones.map(m => (
               <div key={m.id} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  <div className={`w-1.5 h-1.5 rounded-full ${m.branch === 'main' ? 'bg-indigo-400' : 'bg-emerald-400'}`}></div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{m.title}</span>
                  {m.branch && m.branch !== 'main' && (
                      <span className="px-1 py-0 rounded bg-slate-100 dark:bg-slate-800 text-[10px] uppercase tracking-wide text-slate-600 dark:text-slate-400">{m.branch}</span>
                  )}
                  <span className="text-slate-400 opacity-75">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};