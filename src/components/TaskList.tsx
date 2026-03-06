
import React, { useState, useId } from 'react';
import { Play, Pause, Trash2, Plus, RotateCcw, ChevronDown, ChevronRight, Lock, Sparkles, Flag, Tag as TagIcon, Check, X, PlusCircle, CheckCircle2, Circle, Layers, Zap, Clock, MoreHorizontal, CheckSquare, Square } from 'lucide-react';
import { Task, TaskStatus, Milestone, Category, Project, Language } from '../types';
import { Button } from '@heroui/react';
import { Chip } from '@heroui/react';
import { TRANSLATIONS, TAG_COLORS } from '../constants';

interface TaskListProps {
  language: Language;
  tasks: Task[];
  projects: Project[];
  activeTaskId: string | null;
  onAdd: (title: string, description: string, tags: string[], projectId?: string, parentTaskIds?: string[]) => void;
  onDelete: (id: string) => void;
  onDeleteMany?: (ids: string[]) => void;
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
  const contentId = useId();

  return (
    <div className="mb-4 last:mb-20">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between group select-none mb-2 px-1 py-1 sticky top-0 bg-[#f8fafc]/90 dark:bg-[#020617]/90 backdrop-blur-sm z-20"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <div className="flex items-center gap-2">
           <div className={`p-1 rounded-md transition-colors duration-300 ${isOpen ? `text-${color}-600 dark:text-${color}-400` : 'text-neutral-800'}`}>
             <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
           </div>

           <h4 className="font-bold text-neutral-500 dark:text-neutral-400 text-xs flex items-center gap-2">
             {title}
             <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-[10px] font-bold min-w-[1.5rem] text-center">{count}</span>
           </h4>
        </div>

        {progress !== undefined && (
           <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity pr-2">
             <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div style={{ width: `${progress}%` }} className={`h-full bg-${color}-500 rounded-full transition-all duration-1000 ease-out`} />
             </div>
           </div>
        )}
      </button>

      <div
        id={contentId}
        role="region"
        className={`space-y-1.5 transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 h-0 overflow-hidden'}`}
      >
           {children}
      </div>
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
  onDeleteMany,
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
  const [isManagingTags, setIsManagingTags] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} tasks?`)) {
      if (onDeleteMany) {
        onDeleteMany(Array.from(selectedIds));
      } else {
        selectedIds.forEach(id => onDelete(id));
      }
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    }
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 1000 / 60);
    const hr = Math.floor(min / 60);
    if (hr > 0) return `${hr}h ${min % 60}m`;
    return `${min}m`;
  };

  const getTagColor = (tagName: string) => {
      const cat = categories?.find(c => c.name === tagName);
      return cat ? cat.color : 'slate';
  };

  const activeTaskForTagging = tasks.find(t => t.id === taskToTag);

  const filterIcons = {
    all: Layers,
    active: Zap,
    completed: CheckCircle2
  };

  const renderTask = (task: Task, isProjectChild: boolean = false, projectColor: string = 'indigo') => {
    const isRunning = task.status === TaskStatus.RUNNING;
    const isCompleted = task.status === TaskStatus.COMPLETED;
    const isLocked = task.parentTaskIds?.some(pid => tasks.find(pt => pt.id === pid)?.status !== TaskStatus.COMPLETED);
    const hasMilestones = task.milestones && task.milestones.length > 0;
    const isSelected = selectedIds.has(task.id);
    const showEstimated = task.totalTime === 0 && task.estimatedTime && task.estimatedTime > 0;

    return (
      <div
        key={task.id}
        onClick={() => {
          if (isSelectionMode) toggleSelection(task.id);
        }}
        className={`group relative transition-all duration-200 rounded-xl border overflow-hidden ${
          isSelectionMode
            ? isSelected
              ? 'bg-green-50 dark:bg-green-900/10 border-green-500 shadow-sm z-10'
              : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 cursor-pointer'
            : isRunning
              ? 'bg-white dark:bg-slate-900 border-green-500 shadow-md shadow-green/10 z-10 ring-1 ring-terracotta-500/20'
              : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800/50 hover:border-green-300/50 dark:hover:border-slate-700 hover:shadow-sm'
        } ${isCompleted ? 'opacity-60 grayscale-[0.3]' : ''} ${!isSelectionMode && isLocked ? 'opacity-50 bg-neutral-50 dark:bg-neutral-900 pointer-events-none' : ''}`}
      >
        <div className="flex items-center gap-0 min-h-[3.5rem]">
           {/* Color Strip for Projects */}
           {isProjectChild && (
             <div className={`w-1 self-stretch bg-${projectColor}-500 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity`} />
           )}

           <div className="flex-1 flex items-center p-2 gap-3 overflow-hidden">
            {/* Status Button / Checkbox - Compact Size */}
            <button
              disabled={!isSelectionMode && isLocked}
              onClick={(e) => {
                e.stopPropagation();
                if (isSelectionMode) toggleSelection(task.id);
                else onSelect(task.id);
              }}
              className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm group/btn relative overflow-hidden ${
                isSelectionMode
                  ? isSelected
                    ? 'bg-green-400 text-white'
                    : 'bg-white dark:bg-neutral-950 text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-green-400'
                  : isCompleted
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : isRunning
                    ? 'bg-ochre-300 text-white shadow-ochre/40'
                    : isLocked
                    ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed'
                    : 'bg-neutral-50 text-neutral-400 hover:bg-green-500 hover:text-white dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-green-600'
              }`}
            >
              <div className={`transition-transform duration-300 ${isRunning ? 'scale-100' : 'group-hover/btn:scale-110'}`}>
                 {isSelectionMode ? (
                    isSelected ? <Check className="w-4 h-4" /> : <div className="w-4 h-4" />
                 ) : (
                    isCompleted ? <RotateCcw className="w-3.5 h-3.5" /> : isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : isLocked ? <Lock className="w-3 h-3" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                 )}
              </div>
            </button>

            {/* Task Info - Compact Layout */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
               <div className="flex items-center gap-2">
                 <h4 className={`text-sm font-semibold truncate leading-tight ${isCompleted ? 'line-through text-neutral-400 decoration-neutral-300' : 'text-neutral-900 dark:text-neutral-200'}`}>
                    {task.title}
                 </h4>
                 {isLocked && !isSelectionMode && (
                    <Lock className="w-3 h-3 text-ochre-400 shrink-0" />
                 )}
               </div>

               {(hasMilestones || (task.tags && task.tags.length > 0)) && (
                 <div className="flex flex-wrap items-center gap-1.5 h-4">
                    {hasMilestones && (
                        <div className="flex items-center gap-0.5 text-neutral-800">
                          <Flag className="w-2.5 h-2.5" />
                          <span className="text-[9px] font-bold">{task.milestones.length}</span>
                        </div>
                    )}

                    {(task.tags || []).map(tag => (
                      <span key={tag} className={`text-[9px] px-1.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-neutral-500 dark:text-neutral-400`}>
                        {tag}
                      </span>
                    ))}
                 </div>
               )}
            </div>

            {/* Meta & Actions - Right Aligned */}
            <div className="flex items-center gap-2 pl-1 shrink-0">
               <div className={`font-mono text-xs tabular-nums font-medium ${isRunning ? 'text-green-600 dark:text-green-400' : 'text-neutral-800 dark:text-slate-500'}`}>
                 {showEstimated ? (
                   <span className="text-neutral-700 dark:text-neutral-600">Est: {formatDuration(task.estimatedTime || 0)}</span>
                 ) : (
                   formatDuration(task.totalTime)
                 )}
               </div>

               {!isSelectionMode && (
                 <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-all sm:translate-x-2 group-hover:translate-x-0">
                     <button
                       onClick={(e) => { e.stopPropagation(); setTaskToTag(task.id); }}
                       className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-green-500 transition-colors hidden sm:block"
                     >
                       <TagIcon className="w-3.5 h-3.5" />
                     </button>

                     <button
                       onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: isCompleted ? TaskStatus.IDLE : TaskStatus.COMPLETED }); }}
                       className={`p-1.5 rounded-lg transition-all ${isCompleted ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-neutral-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                       title={isCompleted ? "Mark as Incomplete" : "Mark as Done"}
                     >
                       {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                     </button>

                     <button
                        onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete this task?')) onDelete(task.id); }}
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hidden sm:block"
                        title="Delete Task"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                 </div>
               )}
            </div>
           </div>
        </div>
      </div>
    );
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.status === TaskStatus.RUNNING || task.status === TaskStatus.PAUSED || task.status === TaskStatus.IDLE;
    if (filter === 'completed') return task.status === TaskStatus.COMPLETED;
    return true;
  });

  const activeTasks = filteredTasks.filter(t => (t.status === TaskStatus.RUNNING || t.status === TaskStatus.PAUSED) && !t.projectId);
  const todoTasks = filteredTasks.filter(t => t.status === TaskStatus.IDLE && !t.projectId);
  const completedTasks = filteredTasks.filter(t => t.status === TaskStatus.COMPLETED && !t.projectId);

  return (
    <div className="h-full flex flex-col relative bg-[#f8fafc] dark:bg-[#020617]">
      {/* Header & Controls - Compact & Sticky */}
      <div className="flex flex-col gap-3 mb-2 shrink-0 px-3 pt-3 pb-2 sticky top-0 z-30 bg-neutral-50/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-1 h-4 bg-green-500 rounded-full" />
               <h2 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tight">{t.taskExplorer}</h2>
            </div>

            <div className="flex items-center gap-2">
               <div className="bg-neutral-100 dark:bg-neutral-800/50 p-0.5 rounded-lg flex items-center gap-0.5">
                  {(['all', 'active', 'completed'] as const).map(f => {
                    const Icon = filterIcons[f];
                    return (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`
                          p-1.5 rounded-md transition-all duration-300
                          ${filter === f
                            ? 'bg-white dark:bg-neutral-900 text-green-600 shadow-sm'
                            : 'text-neutral-800 hover:text-slate-600 dark:hover:text-neutral-400'
                          }
                        `}
                        title={(t as any)[f]}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
               </div>

               {isSelectionMode && selectedIds.size > 0 ? (
                  <button
                    onClick={handleBulkDelete}
                    className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm animate-in zoom-in"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
               ) : (
                  <>
                    <button
                      onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
                      className={`p-1.5 rounded-lg border transition-all ${isSelectionMode ? 'bg-green-500 border-green-500 text-white' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-800 hover:text-terracotta-500'}`}
                      title="Select"
                    >
                      {isSelectionMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setIsManagingTags(true)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-neutral-800 hover:text-terracotta-500 transition-all"
                      title={t.manageCategories}
                    >
                      <TagIcon className="w-3.5 h-3.5" />
                    </button>
                  </>
               )}
            </div>
         </div>

         {/* Quick Add - Compact */}
         {!isSelectionMode && (
           <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                 <Plus className={`w-4 h-4 transition-colors duration-300 ${isFocused ? 'text-green-500 rotate-90' : 'text-neutral-800'}`} />
              </div>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitTask(e)}
                placeholder={t.quickAdd}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-sm outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/10 transition-all font-medium text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-800 shadow-sm"
              />
              {newTitle && (
                  <button
                    onClick={() => handleSubmitTask()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md animate-in fade-in zoom-in"
                  >
                      <ChevronRight className="w-3 h-3" />
                  </button>
              )}
           </div>
         )}
      </div>

      {/* Task List Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-10">
         {filteredTasks.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
              <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                 <Sparkles className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="text-neutral-800 font-bold uppercase tracking-widest text-[10px]">{t.noTasksYet}</p>
           </div>
         ) : (
           <>
             {activeTasks.length > 0 && (
               <CollapsibleGroup title={t.active} color="indigo" count={activeTasks.length}>
                  {activeTasks.map(task => renderTask(task))}
               </CollapsibleGroup>
             )}

             {/* Projects Group */}
             {projects.map(project => {
                const pTasks = filteredTasks.filter(t => t.projectId === project.id);
                if (pTasks.length === 0) return null;
                const completedCount = pTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
                const progress = Math.round((completedCount / pTasks.length) * 100);

                return (
                  <CollapsibleGroup key={project.id} title={project.name} color={project.color} count={pTasks.length} progress={progress}>
                     {pTasks.map(task => renderTask(task, true, project.color))}
                  </CollapsibleGroup>
                );
             })}

             {todoTasks.length > 0 && (
               <CollapsibleGroup title={t.standaloneTasks} color="slate" count={todoTasks.length}>
                  {todoTasks.map(task => renderTask(task))}
               </CollapsibleGroup>
             )}

             {completedTasks.length > 0 && (
               <CollapsibleGroup title={t.done} color="green" count={completedTasks.length} defaultOpen={false}>
                  {completedTasks.map(task => renderTask(task))}
               </CollapsibleGroup>
             )}
           </>
         )}
      </div>

      {/* Tagging Modal */}
      {taskToTag && activeTaskForTagging && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-2xl shadow-2xl p-5 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black uppercase tracking-widest text-xs">{t.manageCategories}</h3>
                  <button onClick={() => setTaskToTag(null)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800"><X className="w-4 h-4" /></button>
               </div>

               <div className="flex flex-wrap gap-2 mb-5">
                  {categories?.map(cat => (
                     <Chip
                       key={cat.id}
                       color={getTagColor(cat.name) === 'green' ? 'success' : getTagColor(cat.name) === 'ochre' ? 'warning' : getTagColor(cat.name) === 'terracotta' ? 'danger' : 'default'}
                       onClick={() => toggleTaskTag(activeTaskForTagging, cat.name)}
                       className={`px-2.5 py-1 cursor-pointer transition-all text-[10px] ${
                         (activeTaskForTagging.tags || []).includes(cat.name)
                           ? 'border-2 border-green-500 dark:border-green-400'
                           : 'opacity-60 hover:opacity-100'
                       }`}
                     >
                       {cat.name}
                     </Chip>
                  ))}
               </div>
               <div className="text-center">
                  <Button
                    variant="flat"
                    onClick={() => setTaskToTag(null)}
                    className="w-full rounded-xl py-2 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700"
                  >
                    {t.saveConfig}
                  </Button>
               </div>
            </div>
         </div>
      )}

      {/* Manage Global Tags Modal */}
      {isManagingTags && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black uppercase tracking-tight text-lg">{t.manageCategories}</h3>
                  <button onClick={() => setIsManagingTags(false)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800"><X className="w-5 h-5" /></button>
               </div>

               <div className="space-y-2 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                  {categories?.map(cat => (
                     <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-slate-100 dark:border-slate-800">
                        <Chip
                          color={getTagColor(cat.name) === 'green' ? 'success' : getTagColor(cat.name) === 'ochre' ? 'warning' : getTagColor(cat.name) === 'terracotta' ? 'danger' : 'default'}
                          className="px-2.5 py-0.5 text-[10px]"
                        >
                          {cat.name}
                        </Chip>
                        <button onClick={() => { if(window.confirm(t.deleteCategoryConfirm)) onDeleteCategory(cat.id); }} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                     </div>
                  ))}
               </div>

               <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-800 mb-2 block">{t.newCategory}</label>
                  <div className="flex items-center gap-2 mb-3">
                     <div className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800/50 rounded-xl p-2.5 flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full bg-${newTagColor}-500 shrink-0`} />
                        <input
                           className="bg-transparent border-none outline-none text-xs font-bold w-full text-neutral-900 dark:text-neutral-200"
                           placeholder={t.categoryName}
                           value={newTagName}
                           onChange={(e) => setNewTagName(e.target.value)}
                        />
                     </div>
                     <Button
                       isDisabled={!newTagName.trim()}
                       onPress={() => { if(newTagName.trim()) { onAddCategory(newTagName.trim(), newTagColor); setNewTagName(''); } }}
                       className="rounded-xl w-10 h-10 p-0 flex items-center justify-center shrink-0 bg-green-400 text-white"
                     >
                       <Plus className="w-4 h-4" />
                     </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {TAG_COLORS.map(c => (
                        <button
                           key={c}
                           onClick={() => setNewTagColor(c)}
                           className={`w-5 h-5 rounded-md bg-${c}-500 transition-all ${newTagColor === c ? 'ring-2 ring-offset-2 ring-neutral-300 dark:ring-neutral-600 dark:ring-offset-neutral-900 scale-110' : 'opacity-40 hover:opacity-100'}`}
                        />
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
