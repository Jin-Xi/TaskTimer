
import React, { useState } from 'react';
import { Play, Pause, Trash2, Plus, RotateCcw, ChevronDown, ChevronUp, ChevronRight, Lock, Sparkles, Flag, Tag as TagIcon, Check, X, Palette, PlusCircle, Settings2, Hash } from 'lucide-react';
import { Task, TaskStatus, Milestone, Category, Project } from '../types';
import { Button } from './Button';
import { Badge } from './Badge';
import { TRANSLATIONS, TAG_COLORS } from '../constants';

interface TaskListProps {
  language: 'en' | 'zh';
  tasks: Task[];
  projects: Project[];
  activeTaskId: string | null;
  onAdd: (title: string, description: string, tags: string[], projectId?: string, parentTaskIds?: string[]) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onAddMilestone: (taskId: string, title: string, branch: string) => void;
  onEditMilestone: (taskId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

interface CollapsibleGroupProps { 
  title: string; 
  color: string; 
  count: number; 
  progress?: number; 
  children: React.ReactNode; 
  defaultOpen?: boolean 
}

const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({ 
  title, 
  color, 
  count, 
  progress, 
  children, 
  defaultOpen = true 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <div 
        className="flex items-center justify-between px-3 cursor-pointer select-none group py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
           <div className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} text-slate-400 group-hover:text-indigo-500`}>
             <ChevronRight className="w-5 h-5" />
           </div>
           <div className={`w-2 h-5 rounded-full bg-${color}-500 shadow-sm shadow-${color}-500/30`} />
           <h4 className="font-black text-slate-700 dark:text-slate-200 uppercase tracking-[0.2em] text-sm">{title}</h4>
           <span className="text-xs font-bold text-slate-400 ml-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">{count}</span>
        </div>
        {progress !== undefined && (
           <div className="flex items-center gap-3 opacity-50 group-hover:opacity-100 transition-opacity">
             <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${progress}%` }} className={`h-full bg-${color}-500 rounded-full`} />
             </div>
             <span className={`text-[10px] font-black text-${color}-500 w-8 text-right`}>{progress}%</span>
           </div>
        )}
      </div>
      
      {isOpen && (
        <div className="space-y-3 animate-in slide-in-from-top-1 fade-in duration-200">
           {children}
        </div>
      )}
    </div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({ 
  language,
  tasks, 
  projects,
  activeTaskId, 
  onAdd, 
  onDelete, 
  onSelect, 
  onUpdate,
  onAddMilestone,
  onEditMilestone,
  categories,
  onAddCategory,
  onDeleteCategory
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [taskToTag, setTaskToTag] = useState<string | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');
  
  const t = TRANSLATIONS[language];

  const handleSubmitTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newTitle.trim()) {
      onAdd(newTitle.trim(), '', []);
      setNewTitle('');
      setIsFocused(false);
    }
  };

  const toggleTaskTag = (task: Task, tagName: string) => {
    const currentTags = task.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];
    onUpdate(task.id, { tags: newTags });
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 1000 / 60);
    const hr = Math.floor(min / 60);
    if (hr > 0) return `${hr}h ${min % 60}m`;
    return `${min}m`;
  };

  const getTagColor = (tagName: string) => {
      const cat = categories.find(c => c.name === tagName);
      return cat ? cat.color : 'slate';
  };

  const activeTaskForTagging = tasks.find(t => t.id === taskToTag);

  const renderTask = (task: Task, isProjectChild: boolean = false, projectColor: string = 'indigo') => {
    const isRunning = task.status === TaskStatus.RUNNING;
    const isCompleted = task.status === TaskStatus.COMPLETED;

    return (
      <div 
        key={task.id}
        className={`group relative transition-all duration-300 rounded-[2rem] border overflow-hidden ${
          isRunning 
            ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50 ring-4 ring-indigo-500/5' 
            : 'bg-white dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/30'
        } ${isCompleted ? 'opacity-70 grayscale' : ''}`}
      >
        <div className="flex items-stretch min-h-[90px]">
          {isProjectChild && (
            <div className={`w-2 bg-${projectColor}-500 shrink-0 opacity-80`} />
          )}
          
          <div className="flex-1 flex items-center gap-5 p-6 overflow-hidden">
            <button
              onClick={() => onSelect(task.id)}
              className={`shrink-0 w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all shadow-sm ${
                isRunning 
                  ? 'bg-indigo-600 text-white animate-pulse shadow-indigo-500/30'
                  : isCompleted 
                    ? 'bg-emerald-100 text-emerald-500 hover:bg-emerald-200' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600'
              }`}
            >
              {isCompleted ? (
                <RotateCcw className="w-5 h-5" />
              ) : isRunning ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-1" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-5 mb-2">
                <h4 className={`text-base md:text-lg font-bold truncate ${isCompleted ? 'text-slate-400 line-through decoration-2 decoration-slate-300' : 'text-slate-800 dark:text-slate-100'}`}>
                  {task.title}
                </h4>
                <span className="text-xs md:text-sm text-slate-400 font-bold shrink-0 tabular-nums font-mono bg-slate-50 dark:bg-slate-800/80 px-3 py-1 rounded-xl">
                  {formatDuration(task.totalTime)}
                </span>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap relative">
                {task.tags && task.tags.length > 0 && (
                  <TagIcon className="w-3.5 h-3.5 text-slate-300" />
                )}
                {(task.tags || []).map(tag => (
                  <Badge 
                    key={tag} 
                    color={getTagColor(tag)} 
                    className="text-[10px] py-1 px-3 uppercase tracking-wider font-bold whitespace-nowrap cursor-pointer hover:scale-105 shadow-sm"
                    onClick={() => toggleTaskTag(task, tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setTaskToTag(taskToTag === task.id ? null : task.id);
                  }}
                  className={`p-1.5 transition-all hover:scale-110 ${taskToTag === task.id ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-500'}`}
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
                
                {task.milestones?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-indigo-400 dark:text-indigo-500 text-[11px] font-black uppercase tracking-wider ml-1 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-xl">
                    <Flag className="w-3.5 h-3.5" />
                    <span>{task.milestones.length}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                 onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
                 className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all"
               >
                  <Trash2 className="w-5 h-5" />
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const groupedTasks: {[key: string]: Task[]} = {};
  const standalone: Task[] = [];

  tasks.forEach(task => {
      if (filter === 'active' && task.status === TaskStatus.COMPLETED) return;
      if (filter === 'completed' && task.status !== TaskStatus.COMPLETED) return;

      if (task.projectId) {
          if (!groupedTasks[task.projectId]) groupedTasks[task.projectId] = [];
          groupedTasks[task.projectId].push(task);
      } else {
          standalone.push(task);
      }
  });

  return (
    <div className="space-y-8 flex flex-col h-full animate-in fade-in duration-500 max-w-full relative">
      <div className="flex items-center justify-between shrink-0 px-2">
        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em]">{t.taskExplorer}</h2>
      </div>

      {activeTaskForTagging && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-indigo-200 dark:border-indigo-900 rounded-[2.5rem] p-7 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-[60]">
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex flex-col">
              <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">{language === 'zh' ? '正在给任务添加标签' : 'Assigning Tags To'}</p>
              <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[280px]">{activeTaskForTagging.title}</h5>
            </div>
            <button 
              onClick={() => { setTaskToTag(null); setCustomTagInput(''); }}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6 p-1">
             {categories.map(cat => (
               <button
                 key={cat.id}
                 onClick={() => toggleTaskTag(activeTaskForTagging, cat.name)}
                 className={`px-4 py-3 rounded-2xl border text-xs font-black uppercase transition-all flex items-center gap-3 ${activeTaskForTagging.tags.includes(cat.name) ? `bg-${cat.color}-100 border-${cat.color}-500 text-${cat.color}-700 shadow-md` : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-300'}`}
               >
                 <div className={`w-2.5 h-2.5 rounded-full bg-${cat.color}-500`} />
                 {cat.name}
               </button>
             ))}
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-700/50">
            <div className="relative group/input">
              <input 
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all pr-14"
                placeholder={language === 'zh' ? '输入新标签并按回车...' : 'Type new tag and hit Enter...'}
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const name = customTagInput.trim();
                    if (name) {
                      const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
                      if (!existing) {
                        onAddCategory(name, TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);
                      }
                      if (!activeTaskForTagging.tags.includes(name)) {
                        toggleTaskTag(activeTaskForTagging, name);
                      }
                      setCustomTagInput('');
                    }
                  }
                }}
              />
              <button 
                onClick={() => {
                  const name = customTagInput.trim();
                  if (name) {
                    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
                    if (!existing) onAddCategory(name, TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);
                    toggleTaskTag(activeTaskForTagging, name);
                    setCustomTagInput('');
                  }
                }}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${customTagInput.trim() ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 opacity-0'}`}
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`relative transition-all duration-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] border ${isFocused ? 'border-indigo-400 shadow-xl shadow-indigo-500/10 ring-8 ring-indigo-500/5' : 'border-slate-200/60 dark:border-slate-800 shadow-sm'}`}>
        <div className="flex items-center p-4">
          <div className="pl-5 pr-3"><Sparkles className="w-5 h-5 text-indigo-400/50" /></div>
          <input
            type="text"
            placeholder={t.quickAdd}
            className="flex-1 bg-transparent border-none py-4 outline-none text-base font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300"
            value={newTitle}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitTask()}
          />
          <button onClick={() => handleSubmitTask()} className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-90 transition-all ml-2">
            <Plus className="w-7 h-7" />
          </button>
        </div>
      </div>

      <div className="flex bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-2 self-start shrink-0 border border-slate-200/50 dark:border-slate-800">
          <button onClick={() => setFilter('all')} className={`text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>{t.all}</button>
          <button onClick={() => setFilter('active')} className={`text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all ${filter === 'active' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>{t.active}</button>
          <button onClick={() => setFilter('completed')} className={`text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all ${filter === 'completed' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>{t.done}</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 pb-24 space-y-10 no-scrollbar">
        {Object.entries(groupedTasks).map(([pid, pTasks]) => {
            const project = projects.find(p => p.id === pid);
            const total = pTasks.length;
            const done = pTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;
            const color = project?.color || 'indigo';

            return (
                <CollapsibleGroup
                  key={pid}
                  title={project?.name || 'Project'}
                  color={color}
                  count={total}
                  progress={progress}
                >
                    {pTasks.map(task => renderTask(task, true, color))}
                </CollapsibleGroup>
            )
        })}

        {standalone.length > 0 && (
            <CollapsibleGroup
                title={t.standaloneTasks}
                color="slate"
                count={standalone.length}
            >
                {standalone.map(task => renderTask(task, false))}
            </CollapsibleGroup>
        )}
      </div>
    </div>
  );
};
