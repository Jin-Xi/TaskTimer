import React, { useState } from 'react';
import { Play, CheckCircle2, Trash2, Plus, RotateCcw, ChevronDown, ChevronUp, Flag, GitBranch, Pencil, X, Check } from 'lucide-react';
import { Task, TaskStatus, Milestone } from '../types';
import { Button } from './Button';
import { CATEGORIES } from '../constants';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAdd: (title: string, category: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onAddMilestone: (taskId: string, title: string, branch: string) => void;
  onEditMilestone: (taskId: string, milestoneId: string, updates: Partial<Milestone>) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, activeTaskId, onAdd, onDelete, onSelect, onAddMilestone, onEditMilestone }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  // State for inline milestone adding
  const [milestoneInputs, setMilestoneInputs] = useState<{[key: string]: {title: string, branch: string}}>({});
  // State for editing milestone
  const [editingMilestone, setEditingMilestone] = useState<{id: string, title: string, branch: string} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      onAdd(newTitle.trim(), newCategory);
      setNewTitle('');
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

  const handleTimelineSubmit = (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    const input = milestoneInputs[taskId] || { title: '', branch: 'main' };
    if (input.title && input.title.trim()) {
      onAddMilestone(taskId, input.title.trim(), input.branch.trim() || 'main');
      setMilestoneInputs(prev => ({ ...prev, [taskId]: { title: '', branch: 'main' } }));
    }
  };

  const handleStartEdit = (m: Milestone) => {
      setEditingMilestone({ id: m.id, title: m.title, branch: m.branch || 'main' });
  };

  const handleSaveEdit = (taskId: string) => {
      if (editingMilestone) {
          onEditMilestone(taskId, editingMilestone.id, {
              title: editingMilestone.title,
              branch: editingMilestone.branch
          });
          setEditingMilestone(null);
      }
  };

  const getBranchColor = (branch: string) => {
      if (!branch || branch === 'main') return 'bg-indigo-500 border-white dark:border-slate-800';
      const colors = [
          'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500'
      ];
      // Simple hash to pick a color
      let hash = 0;
      for (let i = 0; i < branch.length; i++) hash = branch.charCodeAt(i) + ((hash << 5) - hash);
      return colors[Math.abs(hash) % colors.length] + ' border-white dark:border-slate-800';
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.status !== TaskStatus.COMPLETED;
    if (filter === 'completed') return task.status === TaskStatus.COMPLETED;
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 1000 / 60);
    const hr = Math.floor(min / 60);
    if (hr > 0) return `${hr}h ${min % 60}m`;
    return `${min}m`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          Tasks <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{filteredTasks.length}</span>
        </h3>
        <div className="flex gap-2">
          <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
             <button 
              onClick={() => setFilter('all')}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${filter === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >All</button>
             <button 
              onClick={() => setFilter('active')}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${filter === 'active' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >Active</button>
             <button 
              onClick={() => setFilter('completed')}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${filter === 'completed' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >Done</button>
          </div>
          <Button size="sm" onClick={() => setIsAdding(!isAdding)} variant="primary">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-indigo-50 dark:bg-slate-800 border-b border-indigo-100 dark:border-slate-700 animate-in slide-in-from-top-2">
          <input
            autoFocus
            type="text"
            placeholder="What are you working on?"
            className="w-full mb-3 px-3 py-2 border border-indigo-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <select 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="text-sm px-3 py-2 border border-indigo-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex-1"></div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button type="submit" size="sm">Add Task</Button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500">
            <p>No tasks found.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isExpanded = expandedTasks.has(task.id);
            const hasMilestones = task.milestones && task.milestones.length > 0;
            
            return (
            <div 
              key={task.id}
              className={`rounded-lg border transition-all ${
                activeTaskId === task.id 
                  ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              } ${task.status === TaskStatus.COMPLETED ? 'opacity-90 bg-slate-50 dark:bg-slate-900/50' : ''}`}
            >
              {/* Task Row */}
              <div className="flex items-center justify-between p-3 group">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <button
                    onClick={() => onSelect(task.id)}
                    className={`group/btn flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      activeTaskId === task.id 
                        ? 'bg-indigo-600 text-white' 
                        : task.status === TaskStatus.COMPLETED
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-indigo-600 hover:text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title={task.status === TaskStatus.COMPLETED ? "Restart task" : "Start task"}
                  >
                    {task.status === TaskStatus.COMPLETED ? (
                      <>
                          <CheckCircle2 className="w-5 h-5 block group-hover/btn:hidden" />
                          <RotateCcw className="w-4 h-4 hidden group-hover/btn:block" />
                      </>
                    ) : activeTaskId === task.id ? (
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                  
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleExpand(task.id)}>
                    <h4 className={`text-sm font-medium truncate ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{task.category}</span>
                      <span>•</span>
                      <span className="font-mono">{formatDuration(task.totalTime)}</span>
                      {hasMilestones && (
                         <span className="flex items-center gap-0.5 text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded">
                           <Flag className="w-3 h-3" /> {task.milestones.length}
                         </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => toggleExpand(task.id)}
                    className={`p-1.5 rounded-md transition-colors ${isExpanded ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    title={isExpanded ? "Hide timeline" : "Show timeline"}
                  >
                     {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => onDelete(task.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timeline Section */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 rounded-b-lg">
                   <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 pl-2 mt-2">Activity Timeline</div>
                   
                   <div className="relative pl-4 space-y-4 ml-2 border-l-2 border-slate-200 dark:border-slate-700">
                      {/* Start Point */}
                      <div className="relative">
                         <div className="absolute -left-[21px] bg-slate-200 dark:bg-slate-700 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900"></div>
                         <div className="text-xs text-slate-500 dark:text-slate-400">
                            Task Created • {new Date(task.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                         </div>
                      </div>

                      {/* Milestones */}
                      {(task.milestones || []).map((m) => {
                         const isEditing = editingMilestone?.id === m.id;
                         const branchColor = getBranchColor(m.branch || 'main');
                         const isMain = !m.branch || m.branch === 'main';

                         return (
                         <div key={m.id} className="relative group/milestone transition-all">
                            {/* Branch Connector/Node */}
                            <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 shadow-sm z-10 ${branchColor}`}></div>
                            
                            {/* Content */}
                            <div className={`
                                transition-all
                                ${isMain ? 'ml-0' : 'ml-6'} 
                                ${isEditing ? 'w-full max-w-md' : 'inline-block'}
                            `}>
                               {isEditing ? (
                                   <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-600 rounded p-1 shadow-sm">
                                       <input 
                                         autoFocus
                                         className="flex-1 text-sm px-2 py-1 outline-none bg-transparent text-slate-900 dark:text-white"
                                         value={editingMilestone.title}
                                         onChange={(e) => setEditingMilestone({...editingMilestone, title: e.target.value})}
                                       />
                                       <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                            <GitBranch className="w-3 h-3 text-slate-400"/>
                                            <input 
                                                className="w-16 text-xs bg-transparent outline-none text-slate-600 dark:text-slate-300"
                                                value={editingMilestone.branch}
                                                onChange={(e) => setEditingMilestone({...editingMilestone, branch: e.target.value})}
                                            />
                                       </div>
                                       <button onClick={() => handleSaveEdit(task.id)} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"><Check className="w-4 h-4"/></button>
                                       <button onClick={() => setEditingMilestone(null)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><X className="w-4 h-4"/></button>
                                   </div>
                               ) : (
                                   <div className="flex items-center gap-2">
                                       <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-1.5 shadow-sm group-hover/milestone:border-indigo-200 dark:group-hover/milestone:border-indigo-700 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm text-slate-800 dark:text-slate-200 font-medium">{m.title}</div>
                                                {!isMain && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full text-white opacity-80 ${branchColor.split(' ')[0]}`}>
                                                        {m.branch}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                       </div>
                                       
                                       <button 
                                        onClick={() => handleStartEdit(m)}
                                        className="opacity-0 group-hover/milestone:opacity-100 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-all"
                                       >
                                           <Pencil className="w-3 h-3" />
                                       </button>
                                   </div>
                               )}
                            </div>
                         </div>
                      )})}

                      {/* Add Milestone Input */}
                      <div className="relative">
                         <div className="absolute -left-[21px] bg-slate-300 dark:bg-slate-600 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                            <Plus className="w-2 h-2 text-white" />
                         </div>
                         <form onSubmit={(e) => handleTimelineSubmit(e, task.id)} className="flex flex-wrap gap-2 max-w-md">
                           <input 
                              type="text" 
                              placeholder="New milestone..."
                              className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 flex-1 min-w-[150px] focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 text-slate-900 dark:text-white"
                              value={(milestoneInputs[task.id] || {}).title || ''}
                              onChange={(e) => setMilestoneInputs(prev => {
                                const current = prev[task.id] || { title: '', branch: 'main' };
                                return { ...prev, [task.id]: { ...current, title: e.target.value } };
                              })}
                           />
                           <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2">
                                <GitBranch className="w-3 h-3 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Branch"
                                    className="text-xs w-16 focus:outline-none py-1 bg-transparent text-slate-800 dark:text-slate-200"
                                    value={(milestoneInputs[task.id] || {}).branch || ''}
                                    onChange={(e) => setMilestoneInputs(prev => {
                                      const current = prev[task.id] || { title: '', branch: 'main' };
                                      return { ...prev, [task.id]: { ...current, branch: e.target.value } };
                                    })}
                                />
                           </div>
                           <Button size="sm" type="submit" disabled={!(milestoneInputs[task.id] || {}).title}>Add</Button>
                         </form>
                      </div>
                   </div>
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};