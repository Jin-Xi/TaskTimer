
import React, { useState, useMemo } from 'react';
import { Plus, FolderPlus, Trash2, ChevronRight, List, Pencil, X, Check, ArrowLeft, Info, Layers, Flag, Tag as TagIcon, PlusCircle, Target, Rocket, Activity, Zap } from 'lucide-react';
import { Project, Task, TaskStatus, Category } from '../types';
import { TAG_COLORS, TRANSLATIONS, DEFAULT_CATEGORIES } from '../constants';
import { Button } from './Button';
import { Badge } from './Badge';

interface ProjectManagerProps {
  language: 'en' | 'zh';
  projects: Project[];
  tasks: Task[];
  onAddProject: (name: string, description: string, color: string) => void;
  onDeleteProject: (id: string) => void;
  onAddTask: (title: string, description: string, tags: string[], projectId?: string, parentTaskIds?: string[]) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  categories?: Category[]; 
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  language,
  projects, 
  tasks, 
  onAddProject, 
  onDeleteProject, 
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  categories = DEFAULT_CATEGORIES
}) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: 'indigo' });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isAddingTaskToProject, setIsAddingTaskToProject] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', parentTaskIds: [] as string[] });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [milestoneTaskId, setMilestoneTaskId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const t = TRANSLATIONS[language];

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim()) {
      onAddProject(newProject.name.trim(), newProject.description, newProject.color);
      setNewProject({ name: '', description: '', color: 'indigo' });
      setIsCreatingProject(false);
    }
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim() && isAddingTaskToProject) {
      onAddTask(newTask.title.trim(), newTask.description, [], isAddingTaskToProject, newTask.parentTaskIds);
      setNewTask({ title: '', description: '', parentTaskIds: [] });
      setIsAddingTaskToProject(null);
    }
  };

  const handleUpdateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask && editingTask.title.trim()) {
      onUpdateTask(editingTask.id, {
        title: editingTask.title.trim(),
        description: editingTask.description,
        parentTaskIds: editingTask.parentTaskIds,
      });
      setEditingTask(null);
    }
  };

  const handleAddMilestone = (taskId: string) => {
    if (!newMilestoneTitle.trim()) return;
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newM = {
        id: Math.random().toString(36).substr(2, 9),
        title: newMilestoneTitle.trim(),
        timestamp: Date.now(),
        branch: 'main'
      };
      onUpdateTask(taskId, { milestones: [...(task.milestones || []), newM] });
      setNewMilestoneTitle('');
      setMilestoneTaskId(null);
    }
  };

  const toggleDependency = (taskId: string, list: string[]) => {
    return list.includes(taskId) ? list.filter(id => id !== taskId) : [...list, taskId];
  };

  const orderedProjectTasks = useMemo(() => {
    if (!activeProjectId) return [];
    const pts = tasks.filter(t => t.projectId === activeProjectId);
    
    const levels: Record<string, number> = {};
    const taskMap = new Map(pts.map(t => [t.id, t]));

    const getLevel = (id: string): number => {
      if (levels[id] !== undefined) return levels[id];
      const t = taskMap.get(id);
      if (!t || !t.parentTaskIds || t.parentTaskIds.length === 0) {
        levels[id] = 0;
        return 0;
      }
      const pLevels = t.parentTaskIds.map(pid => getLevel(pid));
      const level = Math.max(...pLevels) + 1;
      levels[id] = level;
      return level;
    };

    pts.forEach(t => getLevel(t.id));
    return pts.sort((a, b) => (levels[a.id] || 0) - (levels[b.id] || 0));
  }, [tasks, activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectColor = activeProject?.color || 'indigo';

  return (
    <div className="flex flex-col w-full h-full gap-4 animate-in fade-in duration-500 relative max-w-6xl mx-auto overflow-hidden">
      {!activeProjectId ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Simplified & Concise Header */}
          <div className="flex items-center justify-between px-4 mb-8 shrink-0">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t.projectPlanner}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{projects.length} Active Tracks</p>
              </div>
            </div>
            <button 
              onClick={() => setIsCreatingProject(true)} 
              className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t.newProject}
            </button>
          </div>

          {/* New Track-based Horizontal List Layout */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20 space-y-6">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] mx-4">
                <Target className="w-16 h-16 text-slate-200 mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">{language === 'zh' ? '暂无项目，点击上方按钮开启' : 'No projects yet. Click above to start.'}</p>
              </div>
            ) : (
              projects.map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const doneCount = projectTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
                const progress = projectTasks.length > 0 
                  ? Math.round((doneCount / projectTasks.length) * 100) 
                  : 0;
                
                // Intuitive next step: First non-completed task in order
                const nextTask = projectTasks.find(t => t.status !== TaskStatus.COMPLETED);
                
                return (
                  <div 
                    key={project.id} 
                    onClick={() => setActiveProjectId(project.id)}
                    className="group relative flex flex-col md:flex-row items-stretch gap-6 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-500/20 transition-all cursor-pointer mx-2"
                  >
                    {/* Progress Circle Visual */}
                    <div className="shrink-0 flex items-center justify-center">
                      <div className="relative w-20 h-20 md:w-24 md:h-24">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="50%" cy="50%" r="42%" className="stroke-slate-100 dark:stroke-slate-800 fill-none stroke-[8px]" />
                          <circle 
                            cx="50%" cy="50%" r="42%" 
                            className={`stroke-${project.color}-500 fill-none stroke-[8px] transition-all duration-1000 ease-out`}
                            style={{ 
                              strokeDasharray: '264', 
                              strokeDashoffset: (264 - (264 * progress) / 100).toString() 
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tighter">{progress}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Info - Center */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                          {project.name}
                        </h3>
                        <Badge color={project.color} className="text-[8px] px-2 py-0.5 font-black uppercase tracking-widest rounded-lg">
                           Track Active
                        </Badge>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium line-clamp-1 opacity-70 mb-4">
                        {project.description || (language === 'zh' ? '点击管理该项目的详细执行步骤。' : 'Manage execution steps for this project.')}
                      </p>
                      
                      {/* Intuitive Next Step Guidance */}
                      <div className="flex items-center gap-4">
                         <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100/50 dark:border-slate-800/50 flex items-center gap-3 overflow-hidden">
                           <div className={`w-8 h-8 rounded-xl bg-${project.color}-100 dark:bg-${project.color}-950/40 flex items-center justify-center text-${project.color}-600 shrink-0`}>
                             <Zap className="w-4 h-4" />
                           </div>
                           <div className="min-w-0">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{language === 'zh' ? '下一步计划' : 'NEXT STEP'}</p>
                             <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">
                               {nextTask ? nextTask.title : (language === 'zh' ? '所有任务已完成' : 'All tasks completed')}
                             </p>
                           </div>
                         </div>
                         <div className="hidden sm:flex flex-col items-end shrink-0">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{language === 'zh' ? '进度明细' : 'HEALTH'}</span>
                            <div className="flex gap-1">
                               {projectTasks.map((t, idx) => (
                                 <div key={idx} className={`w-1.5 h-1.5 rounded-full ${t.status === TaskStatus.COMPLETED ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                               ))}
                            </div>
                         </div>
                      </div>
                    </div>

                    {/* Resume / Action - Right */}
                    <div className="shrink-0 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-8">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{doneCount}/{projectTasks.length}</span>
                        <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">{t.listView}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl transition-all group-hover:scale-110 active:scale-95 shadow-sm">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full animate-in fade-in duration-500 w-full overflow-hidden px-2">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 w-full bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setActiveProjectId(null)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:scale-110 active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-0.5 truncate">{activeProject?.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge color={projectColor} className="text-[8px] font-black uppercase tracking-widest">{activeProject?.color}</Badge>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] opacity-70 truncate max-w-sm">{activeProject?.description}</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsAddingTaskToProject(activeProjectId)} className="rounded-2xl px-6 py-3 text-xs shadow-xl shadow-indigo-500/10 font-black uppercase tracking-widest">
                <Plus className="w-4 h-4 mr-2" />
                {t.addStep}
              </Button>
           </div>

           <div className="flex-1 w-full overflow-y-auto custom-scrollbar pr-1 flex flex-col">
              <div className="flex items-center gap-4 mb-4 px-4 mt-2">
                <div className={`w-1.5 h-4 rounded-full bg-${projectColor}-500 shadow-lg shadow-${projectColor}-500/30`} />
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">{t.workflowSteps}</h4>
                <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50 ml-4" />
                <span className="text-[8px] font-black text-indigo-500 tracking-[0.3em] bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                  {tasks.filter(t => t.projectId === activeProjectId && t.status === TaskStatus.COMPLETED).length} / {orderedProjectTasks.length} DONE
                </span>
              </div>

              <div className="overflow-x-auto custom-scrollbar pb-12 pt-10 w-full flex-grow">
                <div className="flex items-stretch gap-0 min-w-max px-2">
                  {orderedProjectTasks.length === 0 ? (
                    <div className="w-full py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-slate-50/30 flex flex-col items-center justify-center min-w-[280px]">
                       <Layers className="w-10 h-10 text-slate-200 mb-4" />
                       <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[9px]">{t.createTaskHint}</p>
                    </div>
                  ) : (
                    orderedProjectTasks.map((task, idx) => {
                      const isLocked = task.parentTaskIds && task.parentTaskIds.length > 0 
                        ? task.parentTaskIds.some(pid => tasks.find(pt => pt.id === pid)?.status !== TaskStatus.COMPLETED)
                        : false;
                      const isCompleted = task.status === TaskStatus.COMPLETED;

                      return (
                        <div key={task.id} className="flex items-center">
                          <div className={`
                            w-[280px] p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 transition-all duration-500 relative flex flex-col shadow-sm hover:shadow-xl group/card
                            ${isCompleted ? 'border-emerald-500/30 bg-emerald-50/[0.02]' : isLocked ? 'border-slate-100 dark:border-slate-800 opacity-60' : 'border-indigo-50 dark:border-indigo-900/30 hover:border-indigo-400 hover:-translate-y-1'}
                          `}>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg ${isCompleted ? 'bg-emerald-50 text-emerald-600' : isLocked ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600'} text-[8px] font-black uppercase tracking-widest border border-current/10`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : isLocked ? 'bg-slate-300' : 'bg-indigo-500 animate-pulse shadow-[0_0_6px_rgba(99,102,241,0.5)]'}`} />
                                {isCompleted ? 'COMPLETED' : isLocked ? 'LOCKED' : 'READY'}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <button onClick={() => setEditingTask(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => onDeleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                            
                            <h5 className="text-base font-black text-slate-800 dark:text-white mb-1.5 leading-tight tracking-tight">{task.title}</h5>
                            <p className="text-slate-400 text-[10px] mb-4 line-clamp-2 font-medium leading-relaxed">{task.description || (language === 'zh' ? '暂无详细描述' : 'No description provided')}</p>
                            
                            <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/40">
                               <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <Flag className="w-3 h-3 text-indigo-400" />
                                    <span>{task.milestones?.length || 0} {language === 'zh' ? '里程碑' : 'Milestones'}</span>
                                  </div>
                                  <button 
                                    onClick={() => setMilestoneTaskId(task.id)}
                                    className="p-1 rounded-lg hover:bg-indigo-50 text-slate-300 hover:text-indigo-500 transition-all"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                               <div className="space-y-1.5">
                                 {task.milestones?.slice(0, 2).map(m => (
                                   <div key={m.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50">
                                      <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                      <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 truncate tracking-wide">{m.title}</span>
                                   </div>
                                 ))}
                               </div>
                            </div>

                            {task.parentTaskIds?.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/40">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                  <Layers className="w-3 h-3 opacity-40" />
                                  {t.dependsOn}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {task.parentTaskIds.map(pid => (
                                    <span key={pid} className="text-[8px] px-2 py-0.5 rounded-md bg-slate-100/30 dark:bg-slate-800/50 text-slate-500 font-bold truncate max-w-full border border-slate-50 dark:border-slate-700/30">
                                      {tasks.find(t => t.id === pid)?.title}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {idx < orderedProjectTasks.length - 1 && (
                            <div className="flex items-center justify-center px-12 self-center group/arrow">
                               <div className="flex items-center relative">
                                  {/* Connector Line Left */}
                                  <div className={`w-12 h-1.5 rounded-full bg-gradient-to-r from-${projectColor}-500/5 to-${projectColor}-500/80 shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all group-hover/arrow:w-16`} />
                                  
                                  {/* Pulsing Arrow Head Container */}
                                  <div className={`relative z-10 w-14 h-14 rounded-[1.75rem] bg-${projectColor}-600 flex items-center justify-center shadow-2xl shadow-${projectColor}-500/40 border-[4px] border-white dark:border-slate-800 mx-[-28px] group-hover/arrow:scale-125 transition-all duration-500 cursor-help`}>
                                     <ChevronRight className="w-8 h-8 text-white stroke-[4px]" />
                                     <div className={`absolute inset-0 rounded-[1.75rem] bg-${projectColor}-400 animate-ping opacity-30`} />
                                  </div>

                                  {/* Connector Line Right */}
                                  <div className={`w-12 h-1.5 rounded-full bg-gradient-to-l from-${projectColor}-500/5 to-${projectColor}-500/80 shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all group-hover/arrow:w-16`} />
                               </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Enhanced Info Tip Section */}
              <div className="p-8 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[3rem] flex items-start gap-8 mt-4 shrink-0 mx-2">
                <div className="w-14 h-14 rounded-[1.75rem] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                  <Info className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-indigo-900 dark:text-indigo-300 font-black uppercase tracking-[0.2em] mb-2">{language === 'zh' ? '工作流与 WBS 拆解贴士' : 'Workflow & WBS Tips'}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {t.workflowTip}
                  </p>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Modals remained identical for functional consistency ... */}
      {milestoneTaskId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
              <h4 className="text-xl font-black mb-6 flex items-center gap-3">
                <Flag className="w-6 h-6 text-indigo-500" />
                {t.newMilestone}
              </h4>
              <input 
                autoFocus 
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-base outline-none focus:ring-4 focus:ring-indigo-500/10 font-black shadow-inner mb-6" 
                placeholder={t.stepName}
                value={newMilestoneTitle} 
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(milestoneTaskId)}
              />
              <div className="flex gap-3">
                 <Button variant="ghost" className="flex-1 rounded-2xl py-3" onClick={() => setMilestoneTaskId(null)}>{t.cancel}</Button>
                 <Button className="flex-1 rounded-2xl py-3 shadow-lg shadow-indigo-500/10" onClick={() => handleAddMilestone(milestoneTaskId)}>{t.add}</Button>
              </div>
           </div>
        </div>
      )}

      {isCreatingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
              <form onSubmit={handleProjectSubmit} className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight uppercase">{t.createProject}</h3>
                  <div className="space-y-6">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.projectName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-sm shadow-inner transition-all" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.description}</label>
                          <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm h-24 resize-none shadow-inner transition-all leading-relaxed" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">{t.themeColor}</label>
                          <div className="flex flex-wrap gap-4 pl-1">
                              {TAG_COLORS.map(c => (
                                  <button type="button" key={c} onClick={() => setNewProject({...newProject, color: c})} className={`w-10 h-10 rounded-xl bg-${c}-500 border-2 transition-all ${newProject.color === c ? 'border-white dark:border-slate-700 scale-110 shadow-lg ring-2 ring-current/20' : 'border-transparent opacity-60 hover:opacity-100'}`} />
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-10">
                      <Button type="button" variant="ghost" className="rounded-2xl px-8 py-3.5" onClick={() => setIsCreatingProject(false)}>{t.cancel}</Button>
                      <Button type="submit" className="rounded-2xl px-12 py-3.5 shadow-lg shadow-indigo-500/10 font-black text-base">{t.createProject}</Button>
                  </div>
              </form>
          </div>
      )}

      {isAddingTaskToProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
              <form onSubmit={handleTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{t.addStep}</h3>
                      <button type="button" onClick={() => setIsAddingTaskToProject(null)} className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-8 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.stepName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-sm shadow-inner" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                      </div>
                      
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">{t.dependsOn}</label>
                          <div className="max-h-40 overflow-y-auto space-y-2.5 p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 custom-scrollbar">
                             {tasks.filter(t => t.projectId === isAddingTaskToProject).length === 0 ? (
                               <div className="p-6 text-center text-slate-300 font-black uppercase tracking-widest text-[9px] italic">{t.noDependency}</div>
                             ) : (
                               tasks.filter(t => t.projectId === isAddingTaskToProject).map(pt => (
                                 <button
                                   key={pt.id}
                                   type="button"
                                   onClick={() => setNewTask({...newTask, parentTaskIds: toggleDependency(pt.id, newTask.parentTaskIds)})}
                                   className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-xs transition-all ${newTask.parentTaskIds.includes(pt.id) ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500 border border-transparent hover:border-slate-100/30'}`}
                                 >
                                   <span className="truncate pr-4">{pt.title}</span>
                                   {newTask.parentTaskIds.includes(pt.id) ? <Check className="w-5 h-5" /> : <Layers className="w-4 h-4 opacity-20" />}
                                 </button>
                               ))
                             )}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-10">
                      <Button type="button" variant="ghost" className="rounded-2xl px-8 py-3.5" onClick={() => setIsAddingTaskToProject(null)}>{t.cancel}</Button>
                      <Button type="submit" className="rounded-2xl px-12 py-3.5 shadow-lg shadow-indigo-500/10 font-black text-base">{t.add}</Button>
                  </div>
              </form>
          </div>
      )}

      {editingTask && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
              <form onSubmit={handleUpdateTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{language === 'zh' ? '管理任务' : 'Manage Step'}</h3>
                      <button type="button" onClick={() => setEditingTask(null)} className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-8 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.stepName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-sm shadow-inner" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4 ml-2">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{language === 'zh' ? '里程碑列表' : 'Milestone List'}</label>
                           <button 
                             type="button" 
                             onClick={() => {
                               const mTitle = prompt(language === 'zh' ? "里程碑标题" : "Milestone title");
                               if (mTitle) {
                                  const newM = { id: Math.random().toString(36).substr(2, 9), title: mTitle, timestamp: Date.now(), branch: 'main' };
                                  setEditingTask({...editingTask, milestones: [...(editingTask.milestones || []), newM]});
                               }
                             }}
                             className="text-indigo-600 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-indigo-50 px-3 py-1.5 rounded-2xl transition-all"
                           >
                             + {t.add}
                           </button>
                        </div>
                        <div className="space-y-2 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800">
                           {(!editingTask.milestones || editingTask.milestones.length === 0) ? (
                             <p className="text-center text-slate-300 py-6 font-black text-[9px] uppercase italic tracking-widest">{language === 'zh' ? '暂无里程碑' : 'No milestones'}</p>
                           ) : (
                             editingTask.milestones.map(m => (
                               <div key={m.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
                                  <div className="flex items-center gap-3">
                                     <Flag className="w-4 h-4 text-indigo-400" />
                                     <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.title}</span>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => setEditingTask({...editingTask, milestones: editingTask.milestones.filter(x => x.id !== m.id)})}
                                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                             ))
                           )}
                        </div>
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">{t.dependsOn}</label>
                          <div className="max-h-40 overflow-y-auto space-y-2.5 p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 custom-scrollbar">
                             {tasks.filter(t => t.projectId === editingTask.projectId && t.id !== editingTask.id).map(pt => (
                               <button
                                 key={pt.id}
                                 type="button"
                                 onClick={() => setEditingTask({...editingTask, parentTaskIds: toggleDependency(pt.id, editingTask.parentTaskIds)})}
                                 className={`w-full flex items-center justify-between p-4 rounded-xl font-black text-xs transition-all ${editingTask.parentTaskIds.includes(pt.id) ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500 border border-transparent hover:border-slate-100/30'}`}
                               >
                                 <span className="truncate pr-4">{pt.title}</span>
                                 {editingTask.parentTaskIds.includes(pt.id) ? <Check className="w-5 h-5" /> : <Layers className="w-4 h-4 opacity-20" />}
                               </button>
                             ))}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-10">
                      <Button type="button" variant="ghost" className="rounded-2xl px-8 py-3.5" onClick={() => setEditingTask(null)}>{t.cancel}</Button>
                      <Button type="submit" className="rounded-2xl px-12 py-3.5 shadow-lg shadow-indigo-500/10 font-black text-base tracking-wide">{language === 'zh' ? '保存更改' : 'Save Changes'}</Button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
};
