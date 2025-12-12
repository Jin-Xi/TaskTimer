import React, { useState } from 'react';
import { Play, CheckCircle2, Trash2, Plus, Filter, RotateCcw, ChevronDown, ChevronUp, Flag } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { Button } from './Button';
import { CATEGORIES } from '../constants';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAdd: (title: string, category: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onAddMilestone: (taskId: string, title: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, activeTaskId, onAdd, onDelete, onSelect, onAddMilestone }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  // State for inline milestone adding in the timeline
  const [milestoneInputs, setMilestoneInputs] = useState<{[key: string]: string}>({});

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
    const title = milestoneInputs[taskId];
    if (title && title.trim()) {
      onAddMilestone(taskId, title.trim());
      setMilestoneInputs(prev => ({ ...prev, [taskId]: '' }));
    }
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          Tasks <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{filteredTasks.length}</span>
        </h3>
        <div className="flex gap-2">
          <div className="flex bg-slate-200 rounded-lg p-1">
             <button 
              onClick={() => setFilter('all')}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${filter === 'all' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
             >All</button>
             <button 
              onClick={() => setFilter('active')}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${filter === 'active' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
             >Active</button>
             <button 
              onClick={() => setFilter('completed')}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${filter === 'completed' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
             >Done</button>
          </div>
          <Button size="sm" onClick={() => setIsAdding(!isAdding)} variant="primary">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 bg-indigo-50 border-b border-indigo-100 animate-in slide-in-from-top-2">
          <input
            autoFocus
            type="text"
            placeholder="What are you working on?"
            className="w-full mb-3 px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex gap-2">
            <select 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="text-sm px-3 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
          <div className="text-center py-10 text-slate-400">
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
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-300'
              } ${task.status === TaskStatus.COMPLETED ? 'opacity-90 bg-slate-50' : ''}`}
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
                          ? 'bg-green-100 text-green-600 hover:bg-indigo-600 hover:text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
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
                    <h4 className={`text-sm font-medium truncate ${task.status === TaskStatus.COMPLETED ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">{task.category}</span>
                      <span>•</span>
                      <span className="font-mono">{formatDuration(task.totalTime)}</span>
                      {hasMilestones && (
                         <span className="flex items-center gap-0.5 text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                           <Flag className="w-3 h-3" /> {task.milestones.length}
                         </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => toggleExpand(task.id)}
                    className={`p-1.5 rounded-md transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title={isExpanded ? "Hide timeline" : "Show timeline"}
                  >
                     {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => onDelete(task.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timeline Section */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100 rounded-b-lg">
                   <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 pl-2 mt-2">Activity Timeline</div>
                   
                   <div className="relative pl-4 space-y-4 ml-2 border-l-2 border-slate-200">
                      {/* Start Point */}
                      <div className="relative">
                         <div className="absolute -left-[21px] bg-slate-200 w-3 h-3 rounded-full border-2 border-white"></div>
                         <div className="text-xs text-slate-500">
                            Task Created • {new Date(task.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                         </div>
                      </div>

                      {/* Milestones */}
                      {(task.milestones || []).map((m) => (
                         <div key={m.id} className="relative group/milestone">
                            <div className="absolute -left-[21px] bg-indigo-500 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10"></div>
                            <div className="bg-white border border-slate-200 rounded px-2 py-1.5 inline-block shadow-sm">
                               <div className="text-sm text-slate-800 font-medium">{m.title}</div>
                               <div className="text-[10px] text-slate-400">
                                  {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </div>
                            </div>
                         </div>
                      ))}

                      {/* Add Milestone Input */}
                      <div className="relative">
                         <div className="absolute -left-[21px] bg-slate-300 w-3 h-3 rounded-full border-2 border-white flex items-center justify-center">
                            <Plus className="w-2 h-2 text-white" />
                         </div>
                         <form onSubmit={(e) => handleTimelineSubmit(e, task.id)} className="flex gap-2 max-w-sm">
                           <input 
                              type="text" 
                              placeholder="Add a milestone..."
                              className="text-sm bg-white border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                              value={milestoneInputs[task.id] || ''}
                              onChange={(e) => setMilestoneInputs(prev => ({...prev, [task.id]: e.target.value}))}
                           />
                           <Button size="sm" type="submit" disabled={!milestoneInputs[task.id]}>Add</Button>
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