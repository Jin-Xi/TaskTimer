
import React, { useState, useId } from 'react';
import { Play, Pause, Trash2, Plus, RotateCcw, ChevronDown, ChevronRight, Lock, Sparkles, Flag, Tag as TagIcon, Check, X, PlusCircle, CheckCircle2, Circle, Layers, Zap, Clock, MoreHorizontal, CheckSquare, Square } from 'lucide-react';
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
                 onClick={() => setIsManagingTags(true)}
                 className="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                 title="管理分类"
               >
                 <TagIcon className="w-4 h-4" />
               </button>
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
                  <Button
                    isIconOnly
                    size="sm"
                    color="success"
                    onClick={() => handleSubmitTask()}
                    className="motion-animate absolute right-2 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in"
                  >
                      <ChevronRight className="w-3 h-3" />
                  </Button>
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

      {/* Manage Global Tags Modal - Using HeroUI Modal */}
      <Modal
        isOpen={isManagingTags}
        onClose={() => setIsManagingTags(false)}
        size="sm"
        classNames={{
          wrapper: "bg-neutral-950/60 backdrop-blur-sm",
          base: "rounded-3xl",
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
          <ModalHeader className="flex items-center justify-between">
            <h3 className="font-black uppercase tracking-tight text-lg">{t.manageCategories}</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-2 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
              {categories?.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-slate-100 dark:border-slate-800">
                  <Chip color={getChipColor(cat.name)} className="px-2.5 py-0.5 text-[10px]">
                    {cat.name}
                  </Chip>
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="light"
                    onClick={() => { if(window.confirm(t.deleteCategoryConfirm)) onDeleteCategory(cat.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
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
                  className="rounded-xl w-10 h-10 p-0 bg-green-400 text-white"
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
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
