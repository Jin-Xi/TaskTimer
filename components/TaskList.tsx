import React, { useState } from 'react';
import { Play, CheckCircle2, Trash2, Plus, RotateCcw, ChevronDown, ChevronUp, Flag, GitBranch, Pencil, X, Check, Tags as TagsIcon, GripVertical, ListTodo, Lock, Folder } from 'lucide-react';
import { Task, TaskStatus, Milestone, Category, Project } from '../types';
import { Button } from './Button';
import { TAG_COLORS, TRANSLATIONS } from '../constants';

interface TaskListProps {
  language: 'en' | 'zh';
  tasks: Task[];
  projects: Project[];
  activeTaskId: string | null;
  onAdd: (title: string, description: string, tags: string[], projectId?: string, parentTaskId?: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
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
  onAddMilestone, 
  onEditMilestone,
  categories,
  onAddCategory,
  onDeleteCategory
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  const t = TRANSLATIONS[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAdd(newTitle.trim(), newDescription.trim(), selectedTags);
      setNewTitle('');
      setNewDescription('');
      setSelectedTags([]);
      setIsAdding(false);
    }
  };

  const toggleExpand = (taskId: string) => {
    const newSet = new Set(expandedTasks);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setExpandedTasks(newSet);
  };

  const getBranchColor = (branch: string) => {
      if (!branch || branch === 'main') return 'bg-indigo-500 border-white dark:border-slate-800';
      const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500'];
      let hash = 0;
      for (let i = 0; i < branch.length; i++) hash = branch.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length] + ' border-white dark:border-slate-800';
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 1000 / 60);
    const hr = Math.floor(min / 60);
    if (hr > 0) return `${hr}h ${min % 60}m`;
    return `${min}m`;
  };

  const getTagStyle = (tagName: string) => {
      const cat = categories.find(c => c.name === tagName);
      const color = cat ? cat.color : 'slate';
      return `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300 border-${color}-200 dark:border-${color}-800`;
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

  const renderTask = (task: Task) => {
    const isExpanded = expandedTasks.has(task.id);
    const tags = task.tags || [];
    const isLocked = task.parentTaskId ? (tasks.find(pt => pt.id === task.parentTaskId)?.status !== TaskStatus.COMPLETED) : false;

    return (
    <div 
      key={task.id}
      className={`rounded-lg border transition-all ${
        activeTaskId === task.id 
          ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 shadow-sm' 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      } ${task.status === TaskStatus.COMPLETED ? 'opacity-80' : ''} ${isLocked ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between p-3 group">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <button
            onClick={() => !isLocked && onSelect(task.id)}
            disabled={isLocked}
            className={`group/btn flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isLocked 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : activeTaskId === task.id 
                  ? 'bg-indigo-600 text-white' 
                  : task.status === TaskStatus.COMPLETED
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-indigo-600 hover:text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : task.status === TaskStatus.COMPLETED ? (
              <><CheckCircle2 className="w-5 h-5 block group-hover/btn:hidden" /><RotateCcw className="w-4 h-4 hidden group-hover/btn:block" /></>
            ) : activeTaskId === task.id ? (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleExpand(task.id)}>
            <div className="flex items-center gap-2">
                <h4 className={`text-sm font-medium truncate ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                    {task.title}
                </h4>
                {isLocked && <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{t.waitingForParent}</span>}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {tags.map(tag => (
                  <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getTagStyle(tag)}`}>
                      {tag}
                  </span>
              ))}
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{formatDuration(task.totalTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => toggleExpand(task.id)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
             {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 rounded-b-lg">
           {task.description && <div className="text-xs text-slate-500 mb-4 px-2 italic">{task.description}</div>}
           <div className="relative pl-4 space-y-4 ml-2 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="relative">
                 <div className="absolute -left-[21px] bg-slate-200 dark:bg-slate-700 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900"></div>
                 <div className="text-xs text-slate-500 dark:text-slate-400">{t.taskCreated} • {new Date(task.createdAt).toLocaleString()}</div>
              </div>
              {task.milestones.map(m => (
                  <div key={m.id} className="relative group/milestone transition-all">
                    <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 shadow-sm z-10 ${getBranchColor(m.branch)}`}></div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 shadow-sm inline-block min-w-[120px]">
                        <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">{m.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.branch} • {new Date(m.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
              ))}
           </div>
        </div>
      )}
    </div>
    );
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden transition-colors duration-200">
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
             <h3 className="font-semibold text-slate-800 dark:text-slate-200">{t.taskExplorer}</h3>
             <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 ml-2">
                <button onClick={() => setFilter('all')} className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}>{t.all}</button>
                <button onClick={() => setFilter('active')} className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${filter === 'active' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}>{t.active}</button>
                <button onClick={() => setFilter('completed')} className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${filter === 'completed' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}>{t.done}</button>
             </div>
        </div>
        
        <Button size="sm" onClick={() => setIsAdding(!isAdding)} variant="primary">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-indigo-50/50 dark:bg-slate-800/30 border-b border-indigo-100 dark:border-slate-700 animate-in slide-in-from-top-2">
          <input
            autoFocus
            type="text"
            placeholder={t.quickAdd}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all mb-3"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>{t.cancel}</Button>
            <Button type="submit" size="sm">{t.add}</Button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(groupedTasks).map(([pid, pTasks]) => {
            const project = projects.find(p => p.id === pid);
            const total = pTasks.length;
            const completed = pTasks.filter(task => task.status === TaskStatus.COMPLETED).length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
                <div key={pid} className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg bg-${project?.color || 'indigo'}-100 dark:bg-${project?.color || 'indigo'}-900/30 flex items-center justify-center`}>
                                <Folder className={`w-4 h-4 text-${project?.color || 'indigo'}-600 dark:text-${project?.color || 'indigo'}-400`} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100">{project?.name || 'Unknown Project'}</h4>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">{completed} {language === 'zh' ? '之' : 'of'} {total} {t.stepsCompleted}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                             <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                             </div>
                        </div>
                    </div>
                    <div className="space-y-2">{pTasks.map(renderTask)}</div>
                </div>
            )
        })}

        {standalone.length > 0 && (
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <ListTodo className="w-4 h-4 text-slate-500" />
                    </div>
                    <h4 className="font-bold text-slate-600 dark:text-slate-400">{t.standaloneTasks}</h4>
                </div>
                <div className="space-y-2">{standalone.map(renderTask)}</div>
            </div>
        )}

        {tasks.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4"><ListTodo className="w-8 h-8 text-slate-300" /></div>
                <h3 className="text-slate-900 dark:text-white font-medium">{t.noTasksYet}</h3>
                <p className="text-slate-500 text-sm mt-1">{t.createTaskHint}</p>
            </div>
        )}
      </div>
    </div>
  );
};