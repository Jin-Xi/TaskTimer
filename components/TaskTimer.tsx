
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Play, Pause, Flag, Maximize2, CheckCircle2, Sparkles, Timer as TimerIcon, Pencil, Trash2, Check, X, ChevronRight, Coffee, Tag as TagIcon } from 'lucide-react';
import { Task, TaskStatus, Milestone, Category } from '../types';
import { Button } from './Button';
import { Badge } from './Badge';
import { TRANSLATIONS, DEFAULT_CATEGORIES } from '../constants';
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
  categories?: Category[];
}

const SingleTimer: React.FC<SingleTimerProps> = ({ 
  language, task, isHero, onPause, onStart, onBreak, onComplete, onAddMilestone, onEditMilestone, onDeleteMilestone, onEnterFocusMode, onDismiss, categories = DEFAULT_CATEGORIES 
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

  const sessionProgress = isBreak 
    ? Math.min(100, (sessionElapsed / POMODORO_BREAK_MS) * 100)
    : Math.min(100, (sessionElapsed / POMODORO_WORK_MS) * 100);
  
  const showBreakPrompt = isRunning && sessionElapsed >= POMODORO_WORK_MS;

  const getTagColor = (tagName: string) => {
    const cat = categories.find(c => c.name === tagName);
    return cat ? cat.color : 'slate';
  };

  return (
    <div className={`group relative transition-all duration-700 w-full flex flex-col mx-auto max-w-4xl ${
      isHero 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-[0_20px_80px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.4)] rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-16' 
        : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow'
    }`}>
      {(isRunning || isBreak) && (
        <div className={`absolute inset-0 ${isBreak ? 'bg-amber-500/[0.02]' : 'bg-indigo-500/[0.01]'} animate-pulse-gentle pointer-events-none rounded-[inherit]`} />
      )}

      {isHero && onDismiss && (
        <button 
          onClick={() => onDismiss(task.id)}
          className="absolute top-10 right-10 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90 z-20"
          title={language === 'zh' ? '最小化计时器' : 'Minimize timer'}
        >
          <X className="w-6 h-6" />
        </button>
      )}
      
      <div className="flex justify-center items-center gap-5 mb-10">
        {isBreak && (
          <div className="flex items-center gap-3 px-8 py-4 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-full border border-amber-100 dark:border-amber-900/50 animate-bounce">
            <span className="text-2xl">🍅</span>
            <span className="text-xs font-black uppercase tracking-[0.2em]">{t.onBreak}</span>
          </div>
        )}
        <button 
          onClick={() => onComplete(task.id)}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-full hover:bg-emerald-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 group/complete border border-emerald-100 dark:border-emerald-900/50"
        >
          <CheckCircle2 className="w-6 h-6 group-hover/complete:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-[0.2em]">{language === 'zh' ? '点击完成任务' : 'Complete Task'}</span>
        </button>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-full flex flex-col items-center mb-4">
          <div className="flex items-center justify-between w-full mb-6 pr-12">
            <div className="flex items-center gap-4 min-w-0">
               <div className={`shrink-0 w-3.5 h-3.5 rounded-full ${isBreak ? 'bg-amber-500 animate-pulse' : isRunning ? 'bg-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
               <h3 className={`${isHero ? 'text-xl md:text-3xl' : 'text-lg md:text-xl'} font-black text-slate-800 dark:text-slate-200 truncate tracking-tight`}>
                 {task.title}
               </h3>
            </div>
            <button 
              onClick={onEnterFocusMode} 
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
            >
              <Maximize2 className="w-6 h-6" />
            </button>
          </div>
          
          {isHero && task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-700">
               {task.tags.map(tag => (
                 <Badge key={tag} color={getTagColor(tag)} className="px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px]">
                   {tag}
                 </Badge>
               ))}
            </div>
          )}
        </div>

        <div className={`${isHero ? 'text-7xl sm:text-9xl md:text-[11rem] my-10' : 'text-5xl sm:text-6xl md:text-7xl my-8'} font-mono font-bold text-center tabular-nums tracking-tighter leading-none ${isBreak ? 'text-amber-500' : isRunning ? 'text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'text-slate-200 dark:text-slate-800'}`}>
          {formatTime(isBreak ? (POMODORO_BREAK_MS - sessionElapsed) : elapsed)}
        </div>

        {isHero && (isRunning || isBreak) && (
          <div className="w-full max-w-lg mx-auto mb-12 space-y-4">
             <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{isBreak ? t.onBreak : t.sessionProgress}</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">{isBreak ? formatTime(Math.max(0, POMODORO_BREAK_MS - sessionElapsed)) : formatTime(sessionElapsed)}</span>
             </div>
             <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${isBreak ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]'}`}
                  style={{ width: `${sessionProgress}%` }}
                />
             </div>
          </div>
        )}

        {isHero && showBreakPrompt && (
          <div className="w-full max-w-lg mx-auto mb-10 animate-in slide-in-from-top-4">
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50 p-8 rounded-[2.5rem] flex items-center justify-between gap-6 backdrop-blur-sm">
               <div className="flex items-center gap-5">
                 <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-3xl">🍅</div>
                 <p className="text-base font-bold text-amber-800 dark:text-amber-200 leading-tight">{t.pomodoroTip}</p>
               </div>
               <button 
                 onClick={() => onBreak(task.id)}
                 className="shrink-0 px-8 py-4 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
               >
                 {t.startBreak}
               </button>
            </div>
          </div>
        )}

        {isHero && !isBreak && (
          <form 
            onSubmit={handleAddMilestone}
            className="w-full max-w-2xl mx-auto mb-12 group/mile"
          >
            <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 focus-within:border-indigo-500/50 focus-within:ring-8 focus-within:ring-indigo-500/5 transition-all px-8 py-5">
              <Flag className="w-6 h-6 text-indigo-400 mr-5 shrink-0" />
              <input 
                ref={milestoneInputRef}
                className="flex-1 bg-transparent border-none outline-none text-base font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300 placeholder:font-medium"
                placeholder={language === 'zh' ? '记录这一刻的进展...' : 'Record progress at this moment...'}
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!newMilestoneTitle.trim()}
                className={`ml-3 p-2.5 rounded-xl transition-all ${newMilestoneTitle.trim() ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 opacity-0'}`}
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {isHero && sortedMilestones.length > 0 && !isBreak && (
          <div className="w-full max-w-2xl mx-auto space-y-5 max-h-[400px] overflow-y-auto custom-scrollbar px-6 mb-12 py-2 border-t border-slate-50 dark:border-slate-800/50 pt-10">
            {sortedMilestones.map((m, idx) => (
              <div key={m.id} className="relative flex items-center gap-6 group/m animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col items-center">
                  <div className={`w-3.5 h-3.5 rounded-full bg-indigo-500 z-10 shadow-[0_0_8px_rgba(99,102,241,0.4)]`} />
                  {idx < sortedMilestones.length - 1 && (
                    <div className="w-0.5 h-16 bg-indigo-100 dark:bg-indigo-900/40 absolute top-3.5 left-[6.5px]" />
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[1.75rem] shadow-sm hover:shadow-md transition-all group-hover/m:border-indigo-100 group-hover/m:-translate-y-0.5">
                  <div className="flex-1 min-w-0">
                    {editingMilestoneId === m.id ? (
                      <input 
                        autoFocus
                        className="bg-transparent border-b-2 border-indigo-500 outline-none text-base font-bold text-slate-700 dark:text-slate-200 w-full pb-1"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(m.id)}
                        onBlur={() => setEditingMilestoneId(null)}
                      />
                    ) : (
                      <span className="text-base font-bold text-slate-700 dark:text-slate-200 truncate block">{m.title}</span>
                    )}
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-5 ml-4">
                    <span className="text-xs font-mono font-black text-indigo-500/80 bg-indigo-50/50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl">
                       {m.taskTime ? formatTime(m.taskTime) : '--:--:--'}
                    </span>
                    <div className="flex items-center gap-2 opacity-0 group-hover/m:opacity-100 transition-opacity">
                        <button onClick={() => handleStartEdit(m)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Pencil className="w-4.5 h-4.5" /></button>
                        <button onClick={() => onDeleteMilestone(task.id, m.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4.5 h-4.5" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button 
            onClick={() => isBreak ? onStart(task.id) : isRunning ? onPause(task.id) : onStart(task.id)} 
            className={`flex flex-col items-center justify-center transition-all ${isHero ? 'w-28 h-28 sm:w-32 sm:h-32 rounded-[3rem]' : 'w-20 h-20 rounded-[1.75rem]'} ${isBreak ? 'bg-amber-500 text-white shadow-2xl shadow-amber-500/30' : isRunning ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700' : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-500/30 hover:scale-105 active:scale-95'}`}
          >
            {isBreak ? (
              <Play className="w-12 h-12 md:w-14 md:h-14 fill-current ml-1" />
            ) : isRunning ? (
              <Pause className="w-12 h-12 md:w-14 md:h-14" />
            ) : (
              <Play className="w-12 h-12 md:w-14 md:h-14 fill-current ml-1" />
            )}
            {isHero && isBreak && <span className="text-[10px] font-black uppercase tracking-widest mt-2">{t.endBreak}</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TaskTimer: React.FC<TaskTimerProps> = ({ 
  language, activeTasks, onStart, onPause, onBreak, onComplete, onAddTask, onAddMilestone, onEditMilestone, onDeleteMilestone, onEnterFocusMode, onDismiss, suggestedTasks = [], categories = DEFAULT_CATEGORIES 
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
      <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-1000 w-full max-w-4xl mx-auto px-6">
        <div className="relative mb-12 md:mb-20 shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full flex items-center justify-center shadow-inner">
                <TimerIcon className="w-10 h-10 md:w-14 md:h-14 text-indigo-600 dark:text-indigo-500 drop-shadow-sm" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping opacity-20 scale-150" />
        </div>
        
        <h3 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 md:mb-10 tracking-tight leading-tight">
          {t.noActiveTask}
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-lg sm:text-xl md:text-3xl font-medium max-w-2xl mx-auto leading-relaxed mb-16 md:mb-24 opacity-80">
          {t.selectTaskToStart}
        </p>

        {suggestedTasks.length > 0 && (
          <div className="w-full max-w-3xl space-y-8 md:space-y-12">
            <div className="flex items-center gap-5 justify-center">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span className="text-sm font-black uppercase tracking-[0.5em] text-slate-400">{t.suggestedTasks}</span>
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
               {suggestedTasks.map((title, i) => (
                 <button 
                  key={i} 
                  onClick={() => handleAddSuggestedTask(title)}
                  className="px-6 py-3.5 sm:px-10 sm:py-5 rounded-[1.75rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-sm sm:text-base md:text-lg font-bold text-slate-600 dark:text-slate-300 transition-all active:scale-95 shadow-sm hover:shadow-lg"
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

  const currentTask = activeTasks[0];

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-4 duration-700 px-4 sm:px-6 mx-auto flex flex-col items-center">
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
        categories={categories}
      />
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
  categories?: Category[];
}
