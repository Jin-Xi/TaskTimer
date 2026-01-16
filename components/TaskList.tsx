
import React, { useState } from 'react';
import { Play, Pause, Trash2, Plus, RotateCcw, ChevronDown, ChevronUp, Lock, Sparkles, Flag, Tag as TagIcon, Check, X, Palette, PlusCircle, Settings2, Hash } from 'lucide-react';
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
        className={`group relative transition-all duration-300 mb-4 rounded-[1.75rem] border ${
          isRunning 
            ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800/50 ring-4 ring-indigo-500/5' 
            : 'bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-800 shadow-sm'
        } ${isCompleted ? 'opacity-70' : ''}`}
      >
        <div className="flex items-stretch min-h-[80px]">
          {isProjectChild && (
            <div className={`w-1.5 rounded-l-[1.75rem] bg-${projectColor}-500 shrink-0 opacity-80`} />
          )}
          
          <div className="flex-1 flex items-center gap-4 p-5 overflow-hidden">
            <button
              onClick={() => onSelect(task.id)}
              className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                isRunning 
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : isCompleted 
                    ? 'bg-emerald-100 text-emerald-500 hover:bg-emerald-200' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600'
              }`}
            >
              {isCompleted ? (
                <RotateCcw className="w-4 h-4" />
              ) : isRunning ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-1" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-1">
                <h4 className={`text-sm md:text-base font-bold truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                  {task.title}
                </h4>
                <span className="text-[10px] md:text-xs text-slate-400 font-black shrink-0 tabular-nums bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg">
                  {formatDuration(task.totalTime)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap relative">
                {(task.tags || []).map(tag => (
                  <Badge 
                    key={tag} 
                    color={getTagColor(tag)} 
                    className="text-[9px] py-0.5 px-2 uppercase tracking-wider font-black whitespace-nowrap cursor-pointer hover:line-through"
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
                  className={`p-1 transition-all hover:scale-110 ${taskToTag === task.id ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-500'}`}
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
                
                {task.milestones?.length > 0 && (
                  <div className="flex items-center gap-1 text-indigo-400 dark:text-indigo-500 text-[10px] font-black uppercase tracking-wider ml-1 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg">
                    <Flag className="w-3 h-3" />
                    <span>{task.milestones.length}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                 onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
                 className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
               >
                  <Trash2 className="w-4 h-4" />
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
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-500 max-w-full relative">
      <div className="flex items-center justify-between shrink-0 px-1">
        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em]">{t.taskExplorer}</h2>
      </div>

      {/* Relocated Tag Assignment Panel: Anchored at the top of the list area */}
      {activeTaskForTagging && (
        <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-[2rem] p-5 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-[60]">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{language === 'zh' ? '正在给任务添加标签' : 'Assigning Tags To'}</p>
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{activeTaskForTagging.title}</h5>
            </div>
            <button 
              onClick={() => { setTaskToTag(null); setCustomTagInput(''); }}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-5 p-1">
             {categories.map(cat => (
               <button
                 key={cat.id}
                 onClick={() => toggleTaskTag(activeTaskForTagging, cat.name)}
                 className={`px-3 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTaskForTagging.tags.includes(cat.name) ? `bg-${cat.color}-100 border-${cat.color}-500 text-${cat.color}-700` : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-300'}`}
               >
                 <div className={`w-2 h-2 rounded-full bg-${cat.color}-500`} />
                 {cat.name}
               </button>
             ))}
          </div>

          <div className="pt-4 border-t border-slate-50 dark:border-slate-700/50">
            <div className="relative group/input">
              <input 
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all pr-12"
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
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${customTagInput.trim() ? 'bg-indigo-600 text-white' : 'text-slate-300 opacity-0'}`}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`relative transition-all duration-300 bg-white dark:bg-slate-900 rounded-[2rem] border-2 ${isFocused ? 'border-indigo-400 shadow-[0_10px_30px_rgba(99,102,241,0.1)] ring-4 ring-indigo-500/5' : 'border-slate-100 dark:border-slate-800'}`}>
        <div className="flex items-center p-3">
          <div className="pl-4 pr-2"><Sparkles className="w-4 h-4 text-indigo-400/50" /></div>
          <input
            type="text"
            placeholder={t.quickAdd}
            className="flex-1 bg-transparent border-none py-3 outline-none text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-300"
            value={newTitle}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitTask()}
          />
          <button onClick={() => handleSubmitTask()} className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-90 transition-all">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl p-1.5 self-start shrink-0 border border-slate-100 dark:border-slate-800">
          <button onClick={() => setFilter('all')} className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>{t.all}</button>
          <button onClick={() => setFilter('active')} className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all ${filter === 'active' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>{t.active}</button>
          <button onClick={() => setFilter('completed')} className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all ${filter === 'completed' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>{t.done}</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20 space-y-12 no-scrollbar">
        {Object.entries(groupedTasks).map(([pid, pTasks]) => {
            const project = projects.find(p => p.id === pid);
            const total = pTasks.length;
            const done = pTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
                <div key={pid} className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-5 rounded-full bg-${project?.color || 'indigo'}-500 shadow-sm shadow-${project?.color || 'indigo'}-500/30`} />
                        <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-xs">{project?.name || 'Project'}</h4>
                      </div>
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-lg">{progress}%</span>
                    </div>
                    <div className="space-y-1">{pTasks.map(task => renderTask(task, true, project?.color || 'indigo'))}</div>
                </div>
            )
        })}

        {standalone.length > 0 && (
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-1.5 h-5 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs">{t.standaloneTasks}</h4>
                </div>
                <div className="space-y-1">{standalone.map(task => renderTask(task, false))}</div>
            </div>
        )}
      </div>
    </div>
  );
};
