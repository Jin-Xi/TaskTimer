
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Play, Pause, Flag, Maximize2, CheckCircle2, Sparkles, Timer as TimerIcon, Pencil, Trash2, Check, X, ChevronRight, Coffee } from 'lucide-react';
import { Task, TaskStatus, Milestone } from '../types';
import { Button } from './Button';
import { TRANSLATIONS } from '../constants';
import { formatTime } from '../utils/timeUtils';

const POMODORO_WORK_MS = 50 * 60 * 1000;
const POMODORO_BREAK_MS = 5 * 60 * 1000;

interface SingleTimerProps {
  language: 'en' | 'zh';
  task: Task;
  isHero?: boolean;
  onPause: (taskId: string) => void;
  onStart: (taskId: string) => void;
  onBreak: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onAddMilestone: (title: string) => void;
  onEditMilestone: (taskId: string, milestoneId: string, title: string) => void;
  onDeleteMilestone: (taskId: string, milestoneId: string) => void;
  onEnterFocusMode: () => void;
  onDismiss?: (taskId: string) => void;
}

const SingleTimer: React.FC<SingleTimerProps> = ({ 
  language, task, isHero, onPause, onStart, onBreak, onComplete, onAddMilestone, onEditMilestone, onDeleteMilestone, onEnterFocusMode, onDismiss 
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const milestoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (task.status === TaskStatus.RUNNING || task.status === TaskStatus.BREAK) {
      const currentLog = task.logs[task.logs.length - 1];
      const startTime = currentLog ? currentLog.start : Date.now();
      
      const update = () => {
        const now = Date.now();
        const diff = now - startTime;
        setElapsed(task.totalTime + diff);
        setSessionElapsed(diff);
      };

      update();
      interval = setInterval(update, 100);
    } else {
      setElapsed(task.totalTime);
      setSessionElapsed(0);
    }
    return () => clearInterval(interval);
  }, [task]);

  const isRunning = task.status === TaskStatus.RUNNING;
  const isBreak = task.status === TaskStatus.BREAK;
  const t = TRANSLATIONS[language];

  const handleStartEdit = (m: Milestone) => {
    setEditingMilestoneId(m.id);
    setEditTitle(m.title);
  };

  const handleSaveEdit = (mId: string) => {
    if (editTitle.trim()) {
      onEditMilestone(task.id, mId, editTitle.trim());
    }
    setEditingMilestoneId(null);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMilestoneTitle.trim()) {
      onAddMilestone(newMilestoneTitle.trim());
      setNewMilestoneTitle('');
    }
  };

  const sortedMilestones = useMemo(() => {
    return [...(task.milestones || [])].sort((a, b) => a.timestamp - b.timestamp);
  }, [task.milestones]);

  // Pomodoro visualization
  const sessionProgress = isBreak 
    ? Math.min(100, (sessionElapsed / POMODORO_BREAK_MS) * 100)
    : Math.min(100, (sessionElapsed / POMODORO_WORK_MS) * 100);
  
  const showBreakPrompt = isRunning && sessionElapsed >= POMODORO_WORK_MS;

  return (
    <div className={`group relative transition-all duration-700 w-full max-w-4xl mx-auto flex flex-col ${
      isHero 
        ? 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_20px_80px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.4)] rounded-[3.5rem] md:rounded-[4.5rem] p-8 md:p-14' 
        : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-shadow'
    }`}>
      {(isRunning || isBreak) && (
        <div className={`absolute inset-0 ${isBreak ? 'bg-amber-500/[0.02]' : 'bg-indigo-500/[0.01]'} animate-pulse-gentle pointer-events-none rounded-[inherit]`} />
      )}

      {/* Dismiss Button */}
      {isHero && onDismiss && (
        <button 
          onClick={() => onDismiss(task.id)}
          className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90 z-20"
          title={language === 'zh' ? '最小化计时器' : 'Minimize timer'}
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      {/* 1. Status Badge & Complete Button */}
      <div className="flex justify-center items-center gap-4 mb-8">
        {isBreak && (
          <div className="flex items-center gap-2 px-6 py-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-full border border-amber-100 dark:border-amber-900/50 animate-bounce">
            <span className="text-xl">🍅</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.onBreak}</span>
          </div>
        )}
        <button 
          onClick={() => onComplete(task.id)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-full hover:bg-emerald-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 group/complete border border-emerald-100 dark:border-emerald-900/50"
        >
          <CheckCircle2 className="w-5 h-5 group-hover/complete:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{language === 'zh' ? '点击完成任务' : 'Complete Task'}</span>
        </button>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* 2. Header and Focus Mode */}
        <div className="w-full flex items-center justify-between mb-2 pr-12">
          <div className="flex items-center gap-3 min-w-0">
             <div className={`shrink-0 w-2.5 h-2.5 rounded-full ${isBreak ? 'bg-amber-500 animate-pulse' : isRunning ? 'bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
             <h3 className={`${isHero ? 'text-lg md:text-2xl' : 'text-base md:text-lg'} font-black text-slate-800 dark:text-slate-200 truncate tracking-tight`}>
               {task.title}
             </h3>
          </div>
          <button 
            onClick={onEnterFocusMode} 
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* 3. Main Time Display */}
        <div className={`${isHero ? 'text-6xl sm:text-8xl md:text-[10rem] my-8' : 'text-4xl sm:text-5xl md:text-6xl my-6'} font-mono font-black text-center tabular-nums tracking-tighter leading-none ${isBreak ? 'text-amber-500' : isRunning ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-200 dark:text-slate-800'}`}>
          {formatTime(isBreak ? (POMODORO_BREAK_MS - sessionElapsed) : elapsed)}
        </div>

        {/* Pomodoro Session Tracker */}
        {isHero && (isRunning || isBreak) && (
          <div className="w-full max-w-md mx-auto mb-10 space-y-3">
             <div className="flex items-center justify-between px-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isBreak ? t.onBreak : t.sessionProgress}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isBreak ? formatTime(Math.max(0, POMODORO_BREAK_MS - sessionElapsed)) : formatTime(sessionElapsed)}</span>
             </div>
             <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${isBreak ? 'bg-amber-500' : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'}`}
                  style={{ width: `${sessionProgress}%` }}
                />
             </div>
          </div>
        )}

        {/* Break Tip */}
        {isHero && showBreakPrompt && (
          <div className="w-full max-w-md mx-auto mb-8 animate-in slide-in-from-top-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-3xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-xl">🍅</div>
                 <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{t.pomodoroTip}</p>
               </div>
               <button 
                 onClick={() => onBreak(task.id)}
                 className="px-6 py-3 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
               >
                 {t.startBreak}
               </button>
            </div>
          </div>
        )}

        {/* 4. Combined Inline Milestone Input (Centered) */}
        {isHero && !isBreak && (
          <form 
            onSubmit={handleAddMilestone}
            className="w-full max-w-xl mx-auto mb-10 group/mile"
          >
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/40 rounded-full border border-slate-100 dark:border-slate-800/50 focus-within:border-indigo-500/50 focus-within:ring-8 focus-within:ring-indigo-500/5 transition-all px-6 py-4">
              <Flag className="w-5 h-5 text-indigo-400 mr-4 shrink-0" />
              <input 
                ref={milestoneInputRef}
                className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 placeholder:font-medium"
                placeholder={language === 'zh' ? '记录这一刻的进展...' : 'Record progress at this moment...'}
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!newMilestoneTitle.trim()}
                className={`ml-2 p-2 rounded-xl transition-all ${newMilestoneTitle.trim() ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 opacity-0'}`}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* 5. Linear Milestone List */}
        {isHero && sortedMilestones.length > 0 && !isBreak && (
          <div className="w-full max-w-2xl mx-auto space-y-4 max-h-64 overflow-y-auto custom-scrollbar px-4 mb-10 py-2 border-t border-slate-50 dark:border-slate-800/50 pt-8">
            {sortedMilestones.map((m, idx) => (
              <div key={m.id} className="relative flex items-center gap-4 group/m animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full bg-indigo-500 z-10`} />
                  {idx < sortedMilestones.length - 1 && (
                    <div className="w-0.5 h-12 bg-indigo-100 dark:bg-indigo-900/40 absolute top-2.5 left-[4.5px]" />
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all group-hover/m:border-indigo-100">
                  <div className="flex-1 min-w-0">
                    {editingMilestoneId === m.id ? (
                      <input 
                        autoFocus
                        className="bg-transparent border-b border-indigo-500 outline-none text-sm font-bold text-slate-700 dark:text-slate-200 w-full"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(m.id)}
                        onBlur={() => setEditingMilestoneId(null)}
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate block">{m.title}</span>
                    )}
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-4">
                    <span className="text-[10px] font-mono font-black text-indigo-500/60 bg-indigo-50/50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg">
                       {m.taskTime ? formatTime(m.taskTime) : '--:--:--'}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover/m:opacity-100 transition-opacity">
                        <button onClick={() => handleStartEdit(m)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => onDeleteMilestone(task.id, m.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. Combined Start/Pause/EndBreak Button at the bottom */}
        <div className="flex justify-center mt-4">
          <button 
            onClick={() => isBreak ? onStart(task.id) : isRunning ? onPause(task.id) : onStart(task.id)} 
            className={`flex flex-col items-center justify-center transition-all ${isHero ? 'w-24 h-24 sm:w-28 sm:h-28 rounded-[2.5rem]' : 'w-16 h-16 rounded-3xl'} ${isBreak ? 'bg-amber-500 text-white shadow-2xl shadow-amber-500/30' : isRunning ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95'}`}
          >
            {isBreak ? (
              <Play className="w-10 h-10 md:w-12 md:h-12 fill-current ml-1" />
            ) : isRunning ? (
              <Pause className="w-10 h-10 md:w-12 md:h-12" />
            ) : (
              <Play className="w-10 h-10 md:w-12 md:h-12 fill-current ml-1" />
            )}
            {isHero && isBreak && <span className="text-[8px] font-black uppercase tracking-widest mt-1">{t.endBreak}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

interface TaskTimerProps {
  language: 'en' | 'zh';
  activeTasks: Task[];
  onStart: (taskId: string) => void;
  onPause: (taskId: string) => void;
  onBreak: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onAddTask?: (title: string, description: string, tags: string[]) => void;
  onAddMilestone: (taskId: string, title: string, branch: string, parentMilestoneId: string | null, taskTime: number) => void;
  onEditMilestone: (taskId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  onDeleteMilestone: (taskId: string, milestoneId: string) => void;
  onEnterFocusMode?: (taskId: string) => void;
  onDismiss?: (taskId: string) => void;
  suggestedTasks?: string[];
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ 
  language, activeTasks, onStart, onPause, onBreak, onComplete, onAddTask, onAddMilestone, onEditMilestone, onDeleteMilestone, onEnterFocusMode, onDismiss, suggestedTasks = [] 
}) => {
  const t = TRANSLATIONS[language];

  const handleAddMilestoneClick = (taskId: string, title: string) => {
    const task = activeTasks.find(t => t.id === taskId);
    if (!task) return;

    const lastMilestoneId = task.milestones.length > 0 ? task.milestones[task.milestones.length - 1].id : null;

    let currentTaskTime = task.totalTime;
    if (task.status === TaskStatus.RUNNING) {
      const lastLog = task.logs[task.logs.length - 1];
      if (lastLog) {
        currentTaskTime += (Date.now() - lastLog.start);
      }
    }

    onAddMilestone(taskId, title, 'main', lastMilestoneId, currentTaskTime);
  };

  const handleAddSuggestedTask = (title: string) => {
    if (onAddTask) {
      onAddTask(title, '', language === 'zh' ? ['快速任务'] : ['Quick Task']);
    }
  };

  if (activeTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-1000 w-full px-4 overflow-hidden py-10 md:py-20">
        <div className="relative mb-10 md:mb-16 shrink-0">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full flex items-center justify-center shadow-inner">
                <TimerIcon className="w-8 h-8 md:w-12 md:h-12 text-indigo-600 dark:text-indigo-500 drop-shadow-sm" />
            </div>
            <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping opacity-20 scale-150" />
        </div>
        
        <h3 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 md:mb-8 tracking-tight leading-tight">
          {t.noActiveTask}
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-base sm:text-lg md:text-2xl font-medium max-w-xl mx-auto leading-relaxed mb-12 md:mb-20 opacity-80">
          {t.selectTaskToStart}
        </p>

        {suggestedTasks.length > 0 && (
          <div className="w-full max-w-2xl space-y-6 md:space-y-10">
            <div className="flex items-center gap-4 justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">{t.suggestedTasks}</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-5">
               {suggestedTasks.map((title, i) => (
                 <button 
                  key={i} 
                  onClick={() => handleAddSuggestedTask(title)}
                  className="px-5 py-2.5 sm:px-8 sm:py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs sm:text-sm md:text-base font-bold text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm"
                 >
                   {title}
                 </button>
               ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentTask = activeTasks[0]; // Always handle only one due to app logic

  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 px-2 sm:px-4 max-w-5xl mx-auto">
      <SingleTimer 
        language={language}
        task={currentTask}
        isHero={true}
        onPause={onPause}
        onStart={onStart}
        onBreak={onBreak}
        onComplete={onComplete}
        onAddMilestone={(title) => handleAddMilestoneClick(currentTask.id, title)}
        onEditMilestone={(taskId, milestoneId, title) => onEditMilestone(taskId, milestoneId, { title })}
        onDeleteMilestone={onDeleteMilestone}
        onEnterFocusMode={() => onEnterFocusMode?.(currentTask.id)}
        onDismiss={onDismiss}
      />
    </div>
  );
};
