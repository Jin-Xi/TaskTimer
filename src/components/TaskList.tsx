
import React, { useState, useId } from 'react';
import { Play, Pause, Trash2, Plus, RotateCcw, ChevronDown, ChevronRight, ChevronLeft, Lock, Sparkles, Flag, Tag as TagIcon, Check, X, PlusCircle, CheckCircle2, Circle, Layers, Zap, Clock, MoreHorizontal, CheckSquare, Square } from 'lucide-react';
import { Task, TaskStatus, Milestone, Category, Project, Language } from '../types';
import { Button, Chip, Checkbox, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { TRANSLATIONS, TAG_COLORS } from '../constants';
import { StaggeredList } from '../animations/components/StaggeredList';

interface TaskListProps {
  language: Language;
  tasks: Task[];
  projects: Project[];
  activeTaskId: string | null;
  onAdd: (title: string, description: string, tags: string[], projectId?: string, parentTaskId?: string | null) => void;
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
  defaultOpen?: boolean;
  stagger?: boolean;
  staggerDisabled?: boolean;
}

const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({
  title,
  color,
  count,
  progress,
  children,
  defaultOpen = true,
  stagger = false,
  staggerDisabled = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  const content = stagger ? (
    <StaggeredList staggerDelay={0.03} disabled={staggerDisabled}>
      {children}
    </StaggeredList>
  ) : children;

  return (
    <div className="mb-3 last:mb-20">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between group select-none py-2 sticky top-0 bg-neutral-50/95 dark:bg-neutral-950/95 backdrop-blur-sm z-20"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsOpen(!isOpen); } }}
      >
        <div className="flex items-center gap-1.5">
          <ChevronDown className={`w-3 h-3 text-neutral-300 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
          <span className="text-xs font-medium text-neutral-400">
            {title}
            <span className="text-neutral-300 ml-1">({count})</span>
          </span>
        </div>

        {progress !== undefined && (
          <div className="flex items-center opacity-50 group-hover:opacity-80 transition-opacity">
            <div className="w-10 h-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div style={{ width: `${progress}%` }} className={`h-full bg-${color}-400 rounded-full transition-all duration-1000 ease-out`} />
            </div>
          </div>
        )}
      </button>

      <div
        id={contentId}
        role="region"
        className={`flex flex-col gap-3 transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 h-0 overflow-hidden'}`}
      >
        {content}
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
  const [view, setView] = useState<'tasks' | 'categories'>('tasks');
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

  const getChipColor = (tagName: string): 'success' | 'warning' | 'danger' | 'default' => {
    const color = getTagColor(tagName);
    if (color === 'green') return 'success';
    if (color === 'ochre') return 'warning';
    if (color === 'terracotta') return 'danger';
    return 'default';
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
    const isLocked = task.parentTaskId ? tasks.find(pt => pt.id === task.parentTaskId)?.status !== TaskStatus.COMPLETED : false;
    const hasMilestones = task.milestones && task.milestones.length > 0;
    const isSelected = selectedIds.has(task.id);
    const showEstimated = task.totalTime === 0 && task.estimatedTime && task.estimatedTime > 0;

    // 极简微卡片风格
    return (
      <div
        key={task.id}
        onClick={() => {
          if (isSelectionMode) toggleSelection(task.id);
        }}
        className={`
          group flex items-center justify-between px-3 py-2.5 mb-2
          border border-gray-200 dark:border-neutral-700/50 rounded-md
          transition-all duration-150 cursor-pointer
          ${isSelectionMode
            ? isSelected
              ? 'bg-green-50/50 dark:bg-green-900/10 border-green-400'
              : 'bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800/50 hover:border-gray-300'
            : isRunning
              ? 'bg-white dark:bg-neutral-900 border-l-2 border-l-green-500 border-gray-200 dark:border-neutral-700/50'
              : 'bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800/50 hover:border-gray-300 dark:hover:border-neutral-600'
          }
          ${isCompleted ? 'opacity-50' : ''}
          ${!isSelectionMode && isLocked ? 'opacity-40 pointer-events-none' : ''}
        `}
      >
        {/* 左侧：图标 + 任务名称 */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isSelectionMode ? (
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
              <Checkbox
                isSelected={isSelected}
                onValueChange={() => toggleSelection(task.id)}
                isDisabled={isLocked}
                classNames={{ wrapper: 'w-4 h-4 rounded' }}
              />
            </div>
          ) : (
            <button
              disabled={isLocked}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(task.id);
              }}
              className={`shrink-0 transition-colors focus:outline-none ${
                isCompleted
                  ? 'text-green-400'
                  : isRunning
                  ? 'text-ochre-400'
                  : isLocked
                  ? 'text-neutral-200'
                  : 'text-neutral-300 hover:text-green-500'
              }`}
            >
              {isCompleted ? (
                <RotateCcw className="w-4 h-4" strokeWidth={2} />
              ) : isRunning ? (
                <Pause className="w-4 h-4 fill-current" strokeWidth={2} />
              ) : isLocked ? (
                <Lock className="w-3.5 h-3.5" strokeWidth={2} />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" strokeWidth={2} />
              )}
            </button>
          )}

          {/* 任务名称和标签 */}
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-sm truncate max-w-[180px] ${
              isCompleted ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'
            }`}>
              {task.title}
            </span>
            {isLocked && !isSelectionMode && (
              <Lock className="w-3 h-3 text-ochre-400 shrink-0" />
            )}
            {hasMilestones && (
              <div className="flex items-center gap-0.5 text-neutral-400 shrink-0">
                <Flag className="w-2.5 h-2.5" />
                <span className="text-[9px]">{task.milestones.length}</span>
              </div>
            )}
            {(task.tags || []).slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-[10px] text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 shrink-0"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 右侧：时间 + 操作按钮 */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-400 text-xs font-mono tracking-wider">
            {showEstimated ? `Est: ${formatDuration(task.estimatedTime || 0)}` : formatDuration(task.totalTime)}
          </span>

          {!isSelectionMode && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); setTaskToTag(task.id); }}
                className="p-1 text-neutral-300 hover:text-neutral-500 transition-colors"
              >
                <TagIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onUpdate(task.id, { status: isCompleted ? TaskStatus.IDLE : TaskStatus.COMPLETED }); }}
                className={`p-1 transition-colors ${isCompleted ? 'text-green-400' : 'text-neutral-300 hover:text-green-500'}`}
              >
                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete this task?')) onDelete(task.id); }}
                className="p-1 text-neutral-300 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
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
    <div className="h-full flex flex-col relative bg-neutral-50 dark:bg-neutral-950">
      {/* Header & Controls - 极简风格 */}
      <div className="flex flex-col gap-3 mb-2 shrink-0 px-3 pt-3 pb-2 sticky top-0 z-30 bg-neutral-50/95 dark:bg-neutral-950/95 backdrop-blur-md">
         <div className="flex items-center justify-between">
            {/* 左侧：纯文字 Tab 筛选器 */}
            <div className="flex items-center gap-1">
               {(['all', 'active', 'completed'] as const).map((f, idx) => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`text-[13px] transition-all duration-200 ${
                     filter === f
                       ? 'text-neutral-800 dark:text-neutral-200 font-medium'
                       : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400'
                   } ${idx > 0 ? 'before:content-["·"] before:mx-1.5 before:text-neutral-300' : ''}`}
                 >
                   {f === 'all' ? '全部' : f === 'active' ? '活跃' : '已完成'}
                 </button>
               ))}
            </div>

            {/* 右侧：功能按钮 */}
            <div className="flex items-center gap-1">
               {isSelectionMode && selectedIds.size > 0 ? (
                  <button
                    onClick={handleBulkDelete}
                    className="p-1.5 text-red-400 hover:text-red-500 transition-colors"
                    title="删除选中"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               ) : null}
               <button
                 onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
                 className={`p-1.5 transition-colors ${isSelectionMode ? 'text-green-500' : 'text-neutral-400 hover:text-neutral-600'}`}
                 title="多选"
               >
                 {isSelectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
               </button>
               <button
                 onClick={() => setView('categories')}
                 className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                 title="管理分类"
               >
                 <TagIcon className="w-4 h-4" />
               </button>
            </div>
         </div>

         {/* Quick Add - Ghost Input */}
         {!isSelectionMode && view === 'tasks' && (
           <div className="flex items-center gap-2 py-2 cursor-text" onClick={() => document.getElementById('ghost-input')?.focus()}>
              <Plus className={`w-4 h-4 transition-colors duration-200 shrink-0 ${isFocused || newTitle ? 'text-emerald-500' : 'text-neutral-300'}`} />
              <input
                id="ghost-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTitle.trim()) {
                    handleSubmitTask(e);
                    // 保持聚焦状态，方便连续输入
                    setTimeout(() => document.getElementById('ghost-input')?.focus(), 0);
                  }
                }}
                placeholder={t.quickAdd}
                className={`
                  flex-1 bg-transparent border-none outline-none text-sm
                  text-neutral-700 dark:text-neutral-300
                  placeholder:text-neutral-300 dark:placeholder:text-neutral-600
                  transition-all duration-200
                  ${isFocused || newTitle ? 'border-b border-emerald-500' : 'border-b border-transparent'}
                `}
              />
           </div>
         )}
      </div>

      {/* Task List Content */}
      {view === 'tasks' && (
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
                 <CollapsibleGroup title={t.active} color="indigo" count={activeTasks.length} stagger staggerDisabled={activeTasks.length > 100}>
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
                    <CollapsibleGroup key={project.id} title={project.name} color={project.color} count={pTasks.length} progress={progress} stagger staggerDisabled={pTasks.length > 100}>
                       {pTasks.map(task => renderTask(task, true, project.color))}
                    </CollapsibleGroup>
                  );
               })}

               {todoTasks.length > 0 && (
                 <CollapsibleGroup title={t.standaloneTasks} color="slate" count={todoTasks.length} stagger staggerDisabled={todoTasks.length > 100}>
                    {todoTasks.map(task => renderTask(task))}
                 </CollapsibleGroup>
               )}

               {completedTasks.length > 0 && (
                 <CollapsibleGroup title={t.done} color="green" count={completedTasks.length} defaultOpen={false} stagger staggerDisabled={completedTasks.length > 100}>
                    {completedTasks.map(task => renderTask(task))}
                 </CollapsibleGroup>
               )}
             </>
           )}
        </div>
      )}

      {/* Categories Management View */}
      {view === 'categories' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-10">
          {/* Header with back button */}
          <div className="flex items-center gap-2 py-3 sticky top-0 bg-neutral-50/95 dark:bg-neutral-950/95 backdrop-blur-sm z-20">
            <button
              onClick={() => setView('tasks')}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t.manageCategories}</span>
          </div>

          {/* Categories List */}
          <div className="space-y-2 mb-6">
            {categories?.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full bg-${cat.color}-500`} />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{cat.name}</span>
                </div>
                <button
                  onClick={() => { if(window.confirm(t.deleteCategoryConfirm)) onDeleteCategory(cat.id); }}
                  className="p-1 text-neutral-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!categories || categories.length === 0) && (
              <div className="text-center py-8 text-neutral-400 text-sm">
                暂无分类
              </div>
            )}
          </div>

          {/* Add New Category */}
          <div className="pt-4 border-t border-gray-200 dark:border-neutral-800">
            <div className="text-xs text-neutral-400 mb-3">{t.newCategory}</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700/50 rounded-lg p-2.5 flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full bg-${newTagColor}-500 shrink-0`} />
                <input
                  className="bg-transparent border-none outline-none text-sm w-full text-neutral-700 dark:text-neutral-300"
                  placeholder={t.categoryName}
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              <button
                disabled={!newTagName.trim()}
                onClick={() => { if(newTagName.trim()) { onAddCategory(newTagName.trim(), newTagColor); setNewTagName(''); } }}
                className="p-2.5 rounded-lg bg-green-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
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
      )}

      {/* Tagging Modal - Using HeroUI Modal */}
      <Modal
        isOpen={!!taskToTag}
        onClose={() => setTaskToTag(null)}
        size="sm"
        classNames={{
          wrapper: "bg-neutral-950/60 backdrop-blur-sm",
          base: "rounded-2xl",
        }}
        motionProps={{
          variants: {
            enter: {
              scale: 1,
              opacity: 1,
              transition: { duration: 0.2 }
            },
            exit: {
              scale: 0.95,
              opacity: 0,
              transition: { duration: 0.15 }
            }
          }
        }}
      >
        <ModalContent className="bg-white dark:bg-slate-900 text-neutral-900 dark:text-white">
          <ModalHeader className="flex items-center justify-between pb-0">
            <h3 className="font-black uppercase tracking-widest text-xs">{t.manageCategories}</h3>
          </ModalHeader>
          <ModalBody>
            {activeTaskForTagging && (
              <div className="flex flex-wrap gap-2">
                {categories?.map(cat => (
                  <Chip
                    key={cat.id}
                    color={getChipColor(cat.name)}
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
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setTaskToTag(null)}
              className="w-full rounded-xl"
            >
              {t.saveConfig}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
