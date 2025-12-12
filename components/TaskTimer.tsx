import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Clock, Flag, GitBranch } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { Button } from './Button';

interface TaskTimerProps {
  activeTask: Task | null;
  onStart: (taskId: string) => void;
  onPause: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onAddMilestone: (taskId: string, title: string, branch: string) => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ activeTask, onStart, onPause, onComplete, onAddMilestone }) => {
  const [elapsed, setElapsed] = useState(0);
  const [showMilestoneInput, setShowMilestoneInput] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneBranch, setMilestoneBranch] = useState('main');

  useEffect(() => {
    let interval: any;

    if (activeTask && activeTask.status === TaskStatus.RUNNING) {
      // Calculate elapsed based on the current log start time
      const currentLog = activeTask.logs[activeTask.logs.length - 1];
      const startTime = currentLog ? currentLog.start : Date.now();
      
      // Initial sync
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center h-48">
        <div className="bg-indigo-50 p-3 rounded-full mb-4">
          <Clock className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No active task</h3>
        <p className="text-slate-500 text-sm mt-1">Select a task from the list to start timing.</p>
      </div>
    );
  }

  // Get last 3 milestones to show context
  const recentMilestones = activeTask.milestones 
    ? [...activeTask.milestones].reverse().slice(0, 3) 
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6 relative overflow-hidden flex flex-col gap-6">
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-100">
        <div 
          className="h-full bg-indigo-500 transition-all duration-1000" 
          style={{ width: activeTask.status === TaskStatus.RUNNING ? '100%' : '0%' }}
        />
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded mb-2">
            {activeTask.category}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 truncate max-w-md" title={activeTask.title}>
            {activeTask.title}
          </h2>
          <p className="text-slate-500 text-sm mt-1 truncate max-w-md">
            {activeTask.description || "No description provided"}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-5xl font-mono font-bold text-slate-900 tracking-tight mb-4 tabular-nums">
            {formatTime(elapsed)}
          </div>
          
          <div className="flex items-center gap-3">
            {activeTask.status === TaskStatus.RUNNING ? (
              <Button 
                variant="secondary" 
                onClick={() => onPause(activeTask.id)}
                className="w-32"
              >
                <Pause className="w-4 h-4 mr-2" /> Pause
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={() => onStart(activeTask.id)}
                className="w-32"
              >
                <Play className="w-4 h-4 mr-2" /> Resume
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={() => onComplete(activeTask.id)}
              className="text-slate-500 hover:text-green-600 hover:bg-green-50"
              title="Complete Task"
            >
              <Square className="w-5 h-5" />
            </Button>

            <div className="w-px h-8 bg-slate-200 mx-2"></div>

             <Button 
              variant="ghost" 
              onClick={() => setShowMilestoneInput(true)}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              title="Add Milestone"
            >
              <Flag className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Milestone Input Overlay or Section */}
      {showMilestoneInput && (
        <form onSubmit={handleMilestoneSubmit} className="flex flex-col sm:flex-row gap-2 animate-in fade-in slide-in-from-top-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
           <div className="flex items-center flex-1 gap-2">
               <Flag className="w-5 h-5 text-indigo-400" />
               <input 
                  autoFocus
                  type="text" 
                  placeholder="Milestone name..." 
                  className="w-full bg-transparent border-b border-indigo-200 focus:border-indigo-500 outline-none px-1 py-1 text-sm text-slate-800 placeholder:text-slate-400"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
               />
           </div>
           
           <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 bg-white rounded-md border border-indigo-200 px-2 py-1">
                <GitBranch className="w-3 h-3 text-slate-400" />
                <input
                    type="text"
                    placeholder="Branch (main)"
                    className="w-20 text-xs outline-none bg-transparent"
                    value={milestoneBranch}
                    onChange={(e) => setMilestoneBranch(e.target.value)}
                />
             </div>
             
             <button type="submit" className="text-xs font-medium text-white bg-indigo-600 px-3 py-1.5 rounded-md hover:bg-indigo-700">Add</button>
             <button type="button" onClick={() => setShowMilestoneInput(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2">Cancel</button>
           </div>
        </form>
      )}

      {/* Recent Milestones Ticker */}
      {!showMilestoneInput && recentMilestones.length > 0 && (
         <div className="flex gap-4 border-t border-slate-100 pt-3 overflow-hidden">
            {recentMilestones.map(m => (
               <div key={m.id} className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
                  <div className={`w-2 h-2 rounded-full ${m.branch === 'main' ? 'bg-indigo-400' : 'bg-emerald-400'}`}></div>
                  <span className="font-medium text-slate-700">{m.title}</span>
                  {m.branch && m.branch !== 'main' && (
                      <span className="px-1 py-0.5 rounded bg-slate-100 text-[10px] uppercase tracking-wide">{m.branch}</span>
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