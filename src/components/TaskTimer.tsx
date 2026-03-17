
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Play, Pause, Flag, Maximize2, CheckCircle2, Sparkles, Timer as TimerIcon, Pencil, Trash2, Check, X, ChevronRight, Coffee, Tag as TagIcon, ArrowRight, CornerDownRight, GripVertical } from 'lucide-react';
import { Task, TaskStatus, Milestone, Category, Language } from '../types';
import { Chip } from '@heroui/react';
import { TRANSLATIONS, DEFAULT_CATEGORIES } from '../constants';
import { formatTime } from '../utils/timeUtils';

const POMODORO_WORK_MS = 50 * 60 * 1000;
const POMODORO_BREAK_MS = 5 * 60 * 1000;

interface SingleTimerProps {
  language: Language;
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
  const [splitPosition, setSplitPosition] = useState(() => {
    const saved = localStorage.getItem('chrono_split_position');
    return saved ? parseFloat(saved) : 65;
  });
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

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const startLeftWidth = containerRect.width * (splitPosition / 100);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newLeftWidth = startLeftWidth + deltaX;
      const newPercent = (newLeftWidth / containerRect.width) * 100;
      const clampedPercent = Math.max(30, Math.min(85, newPercent));
      setSplitPosition(clampedPercent);
    };

    const handleMouseUp = () => {
      localStorage.setItem('chrono_split_position', String(splitPosition));
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const sortedMilestones = useMemo(() => {
    return [...(task.milestones || [])].sort((a, b) => b.timestamp - a.timestamp);
  }, [task.milestones]);

  const sessionProgress = isBreak
    ? Math.min(100, (sessionElapsed / POMODORO_BREAK_MS) * 100)
    : Math.min(100, (sessionElapsed / POMODORO_WORK_MS) * 100);

  const showBreakPrompt = isRunning && sessionElapsed >= POMODORO_WORK_MS;

  const getTagColor = (tagName: string) => {
    const cat = categories.find(c => c.name === tagName);
    return cat ? cat.color : 'slate';
  };

  const getChipColor = (tagName: string): 'success' | 'warning' | 'danger' | 'default' => {
    const color = getTagColor(tagName);
    if (color === 'green') return 'success';
    if (color === 'ochre') return 'warning';
    if (color === 'terracotta') return 'danger';
    return 'default';
  };

  const themeColor = isBreak ? 'ochre' : 'green';

  return (
    <div className={`
      relative w-full max-w-[90rem] mx-auto flex flex-col lg:flex-row
      bg-white dark:bg-neutral-900
      border border-neutral-200 dark:border-neutral-800
      rounded-lg
      overflow-hidden transition-all duration-500 group
      ${isHero ? 'min-h-[60vh] lg:h-[80vh]' : 'h-auto'}
    `}>

      {/* LEFT SECTION: Timer Core */}
      <div
        className="flex flex-col items-center justify-between p-6 md:p-10 lg:p-12 relative z-10 min-w-0"
        style={{ width: window.innerWidth >= 1024 ? `${splitPosition}%` : '100%' }}
      >

        {/* Top Header */}
        <div className="w-full flex justify-between items-start mb-4 md:mb-0">
           <div className="flex flex-wrap gap-2">
              {task.tags?.map(tag => (
                 <Chip key={tag} color={getChipColor(tag)} className="px-1 py-0.5 h-auto rounded-full text-[10px] uppercase tracking-widest">
                   {tag}
                 </Chip>
              ))}
           </div>

           <div className="flex gap-2 shrink-0">
              <button
                onClick={onEnterFocusMode}
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-neutral-700 transition-all active:scale-95"
                title="Focus Mode"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              {isHero && onDismiss && (
                <button
                  onClick={() => onDismiss(task.id)}
                  className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500 hover:text-ochre-300 hover:bg-terracotta-50 dark:hover:bg-terracotta-900/20 transition-all active:scale-95"
                  title="Minimize"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
           </div>
        </div>

        {/* Center Timer Display */}
        <div className="flex flex-col items-center text-center w-full my-6 md:my-0">
           <h3 className="text-xl md:text-3xl font-black text-neutral-900 dark:text-neutral-100 mb-2 md:mb-6 max-w-2xl leading-tight line-clamp-2">
             {task.title}
           </h3>

           {/* Responsive Timer Text */}
           <div className="w-full flex justify-center py-2 md:py-4 overflow-hidden">
              <span className={`
                 font-mono font-bold tabular-nums tracking-tighter leading-none select-none
                 bg-clip-text text-transparent bg-gradient-to-b
                 ${isBreak ? 'from-ochre-300 to-ochre-400' : isRunning ? 'from-green-400 to-green-600 dark:from-green-300 dark:to-green-500' : 'from-neutral-400 to-neutral-600'}
                 text-[length:clamp(1.5rem,6vw,3.5rem)]
                 sm:text-[length:clamp(2rem,5vw,4rem)]
                 md:text-5xl
                 lg:text-6xl
                 xl:text-7xl
                 max-w-full overflow-hidden
                 transition-all duration-300 drop-shadow-sm
              `}>
                {formatTime(isBreak ? (POMODORO_BREAK_MS - sessionElapsed) : elapsed)}
              </span>
           </div>

           {/* Progress Bar */}
           <div className="w-full max-w-[200px] md:max-w-xs mt-4 md:mt-8 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex justify-between px-1">
                 <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-widest">{isBreak ? t.onBreak : t.sessionProgress}</span>
                 <span className={`text-[10px] font-bold uppercase tracking-widest ${isBreak ? 'text-ochre-300' : 'text-green-500'}`}>{Math.round(sessionProgress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${isBreak ? 'bg-ochre-300' : 'bg-green-400'}`}
                  style={{ width: `${sessionProgress}%` }}
                />
              </div>
           </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-center gap-6 md:gap-10 pb-2 md:pb-0">
           <button
             onClick={() => onComplete(task.id)}
             className="flex flex-col items-center gap-2 group/btn"
             title="Complete Task"
           >
             <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 group-hover/btn:bg-green-500 group-hover/btn:text-white transition-all active:scale-95 shadow-sm flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover/btn:text-green-500 transition-colors hidden md:block">完成</span>
           </button>

           <button
             onClick={() => isBreak ? onStart(task.id) : isRunning ? onPause(task.id) : onStart(task.id)}
             className={`
               relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-[2rem] transition-all duration-300 shadow-xl active:scale-95
               ${isBreak
                 ? 'bg-ochre-300 text-white shadow-ochre/40 hover:bg-ochre-400'
                 : isRunning
                   ? 'bg-white dark:bg-neutral-800 text-green-600 dark:text-white shadow-green/10 border-4 border-green-50 dark:border-neutral-700'
                   : 'bg-green-500 text-white shadow-green/40 hover:bg-green-600 hover:scale-105'}
             `}
           >
             {isRunning ? <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" /> : <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />}
           </button>

           <button
             onClick={() => onBreak(task.id)}
             disabled={isBreak}
             className={`flex flex-col items-center gap-2 group/btn ${isBreak ? 'opacity-50 cursor-not-allowed' : ''}`}
             title="Take Break"
           >
             <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-sm ${showBreakPrompt ? 'bg-ochre-100 text-ochre-600 animate-pulse' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 group-hover/btn:bg-ochre-300 group-hover/btn:text-white'}`}>
                <Coffee className="w-5 h-5 md:w-6 md:h-6" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 group-hover/btn:text-ochre-300 transition-colors hidden md:block">Break</span>
           </button>
        </div>
      </div>

      {/* Resizable Split Handle (Desktop only) */}
      <div
        className="hidden lg:block w-1 bg-neutral-200 dark:bg-neutral-700 hover:bg-green-500 transition-colors relative z-20 shrink-0 cursor-col-resize"
        onMouseDown={handleDragStart}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-white dark:bg-neutral-800 border-2 border-green-500 rounded-lg shadow-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <GripVertical className="w-3 h-3 text-green-500" />
        </div>
      </div>

      {/* RIGHT SECTION: Milestones (Sidebar on Desktop, Bottom on Mobile) */}
      <div
        className="w-full bg-neutral-50/80 dark:bg-neutral-950/30 border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-neutral-800/50 flex flex-col shrink-0 lg:h-full transition-all duration-300"
        style={{ width: window.innerWidth >= 1024 ? `${100 - splitPosition}%` : '100%' }}
      >
         <div className="p-5 md:p-6 border-b border-neutral-100 dark:border-neutral-800/50 flex items-center justify-between bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
               <Flag className="w-4 h-4 text-neutral-800" />
               <h4 className="font-bold text-xs uppercase tracking-widest text-neutral-500">{t.newMilestone}</h4>
            </div>
            <span className="bg-white dark:bg-slate-800 border border-neutral-100 dark:border-neutral-700 px-2 py-0.5 rounded-lg text-[10px] font-black text-neutral-800">{task.milestones?.length || 0}</span>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 min-h-[160px] max-h-[300px] lg:max-h-none lg:min-h-0 bg-neutral-50/30 dark:bg-neutral-900/10">
            {sortedMilestones.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center">
                    <CornerDownRight className="w-4 h-4 text-neutral-400" />
                  </div>
                  <p className="text-[10px] font-bold text-neutral-800 max-w-[150px]">{language === 'zh-TW' ? '記錄關鍵進展...' : '记录关键进展...'}</p>
               </div>
            ) : (
               sortedMilestones.map((m) => (
                  <div key={m.id} className="group/item relative bg-white dark:bg-neutral-900 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800/80 hover:border-green-200 dark:hover:border-neutral-700 transition-all shadow-sm">
                     <div className="flex justify-between items-start gap-3 mb-1">
                        {editingMilestoneId === m.id ? (
                           <input
                              autoFocus
                              className="w-full bg-transparent border-b-2 border-green-500 outline-none text-sm font-bold"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(m.id)}
                              onBlur={() => setEditingMilestoneId(null)}
                           />
                        ) : (
                           <p className="text-sm font-bold text-neutral-900 dark:text-neutral-200 leading-tight">{m.title}</p>
                        )}
                     </div>

                     <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-mono font-medium text-neutral-800 bg-neutral-50 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                           {m.taskTime ? formatTime(m.taskTime) : '00:00:00'}
                        </span>

                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                           <button onClick={() => handleStartEdit(m)} className="p-1 text-neutral-800 hover:text-green-500"><Pencil className="w-3 h-3" /></button>
                           <button onClick={() => onDeleteMilestone(task.id, m.id)} className="p-1 text-neutral-800 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>

         <div className="p-4 border-t border-neutral-100 dark:border-neutral-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <form onSubmit={handleAddMilestone} className="relative group/input">
                <input
                  ref={milestoneInputRef}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-3 outline-none text-xs font-bold text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-800 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all shadow-inner"
                  placeholder={language === 'zh-TW' ? '新增節點...' : '添加节点...'}
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newMilestoneTitle.trim()}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${newMilestoneTitle.trim() ? 'bg-green-500 text-white shadow-md hover:scale-105' : 'text-neutral-400'}`}
                >
                   <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </form>
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
      onAddTask(title, '', ['快速任务']);
    }
  };

  if (activeTasks.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700 py-10 px-4">
        <div
            className="relative mb-8 group cursor-pointer"
            onClick={() => document.getElementById('quick-add-input')?.focus()}
        >
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-terracotta-500/10 border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-all duration-500 relative z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-terracotta-500/5 to-olive-500/5 rounded-[2rem]" />
                <TimerIcon className="w-10 h-10 md:w-14 md:h-14 text-green-500/80 group-hover:text-green-500 transition-colors" />
            </div>
            {/* Decorative Pulse Rings */}
            <div className="absolute inset-0 border-2 border-dashed border-terracotta-200 dark:border-terracotta-900 rounded-[2rem] animate-[spin_10s_linear_infinite] opacity-50 pointer-events-none scale-110" />
            <div className="absolute inset-0 bg-ochre-300/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>

        <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          {t.noActiveTask}
        </h3>
        <p className="text-neutral-500 dark:text-neutral-800 text-sm md:text-base font-medium max-w-sm mx-auto leading-relaxed mb-10">
          {t.selectTaskToStart}
        </p>

        {suggestedTasks.length > 0 && (
          <div className="w-full max-w-2xl space-y-6 animate-in slide-in-from-bottom-6 duration-1000 delay-200">
            <div className="flex items-center gap-4 justify-center">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-800">
                <Sparkles className="w-3 h-3 text-ochre-300" />
                {t.suggestedTasks}
              </div>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
            </div>

            <div className="flex flex-wrap justify-center gap-3">
               {suggestedTasks.map((title, i) => (
                 <button
                  key={i}
                  onClick={() => handleAddSuggestedTask(title)}
                  className="group relative px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-terracotta-500/30 text-xs md:text-sm font-bold text-slate-600 dark:text-neutral-400 transition-all active:scale-95 shadow-sm hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-terracotta-50 to-white dark:from-terracotta-900/20 dark:to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <span className="relative z-10 flex items-center gap-2">
                     {title}
                     <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-green-500" />
                   </span>
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
    <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 px-4 md:px-8 py-4">
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
  language: Language;
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
