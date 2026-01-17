
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, FolderPlus, Trash2, ChevronRight, ChevronLeft, List, Pencil, X, Check, ArrowLeft, Info, Layers, Flag, Tag as TagIcon, PlusCircle, Target, Rocket, Activity, Zap, GitBranchPlus, Calendar, Clock, Download } from 'lucide-react';
import { Project, Task, TaskStatus, Category, DayOfWeek, ProjectSchedule } from '../types';
import { TAG_COLORS, TRANSLATIONS, DEFAULT_CATEGORIES } from '../constants';
import { Button } from './Button';
import { Badge } from './Badge';

interface ProjectManagerProps {
  language: 'en' | 'zh';
  projects: Project[];
  tasks: Task[];
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
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
  onUpdateProject,
  onDeleteProject, 
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  categories = DEFAULT_CATEGORIES
}) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // New Project State
  const [newProject, setNewProject] = useState<{
    name: string;
    description: string;
    color: string;
    startDate: string;
    endDate: string;
    scheduleType: 'daily' | 'weekly';
    selectedDays: DayOfWeek[];
  }>({ 
    name: '', 
    description: '', 
    color: 'indigo',
    startDate: '',
    endDate: '',
    scheduleType: 'daily',
    selectedDays: []
  });

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isAddingTaskToProject, setIsAddingTaskToProject] = useState<string | null>(null);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', parentTaskIds: [] as string[] });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [milestoneTaskId, setMilestoneTaskId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

  const displayedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return projects.slice(start, start + ITEMS_PER_PAGE);
  }, [projects, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const t = TRANSLATIONS[language];
  const DAYS_OF_WEEK: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name.trim()) {
      const schedule: ProjectSchedule = {
        type: newProject.scheduleType,
        days: newProject.scheduleType === 'weekly' ? newProject.selectedDays : undefined
      };

      onAddProject({
        name: newProject.name.trim(),
        description: newProject.description,
        color: newProject.color,
        startDate: newProject.startDate || undefined,
        endDate: newProject.endDate || undefined,
        schedule: schedule
      });

      setNewProject({ 
        name: '', 
        description: '', 
        color: 'indigo', 
        startDate: '', 
        endDate: '', 
        scheduleType: 'daily',
        selectedDays: []
      });
      setIsCreatingProject(false);
      
      const newTotal = projects.length + 1;
      setCurrentPage(Math.ceil(newTotal / ITEMS_PER_PAGE));
    }
  };

  const handleEditProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && editingProject.name.trim()) {
      onUpdateProject(editingProject.id, {
        name: editingProject.name.trim(),
        description: editingProject.description,
        color: editingProject.color,
        startDate: editingProject.startDate,
        endDate: editingProject.endDate,
        schedule: editingProject.schedule
      });
      setEditingProject(null);
    }
  };

  const toggleDaySelection = (day: DayOfWeek) => {
    setNewProject(prev => {
      const exists = prev.selectedDays.includes(day);
      const newDays = exists 
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day];
      return { ...prev, selectedDays: newDays };
    });
  };

  const toggleEditDaySelection = (day: DayOfWeek) => {
    if (!editingProject) return;
    const currentSchedule = editingProject.schedule || { type: 'daily' };
    const currentDays = currentSchedule.days || [];
    const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
    
    setEditingProject({
        ...editingProject,
        schedule: { ...currentSchedule, days: newDays, type: 'weekly' }
    });
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim() && activeProjectId) {
      onAddTask(newTask.title.trim(), newTask.description, [], activeProjectId, newTask.parentTaskIds);
      setNewTask({ title: '', description: '', parentTaskIds: [] });
      setIsAddingTaskToProject(null);
      setIsAddingRoot(false);
    }
  };

  const handleUpdateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask && editingTask.title.trim()) {
      onUpdateTask(editingTask.id, {
        title: editingTask.title.trim(),
        description: editingTask.description,
        parentTaskIds: editingTask.parentTaskIds,
        tags: editingTask.tags,
        milestones: editingTask.milestones
      });
      setEditingTask(null);
    }
  };

  const handleExportProject = (project: Project) => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const exportData = {
      project: project,
      tasks: projectTasks,
      exportedAt: new Date().toISOString(),
      appVersion: "1.0.0"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_export.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const projectTasks = useMemo(() => {
    if (!activeProjectId) return [];
    return tasks.filter(t => t.projectId === activeProjectId);
  }, [tasks, activeProjectId]);

  // Logic to build horizontal chains for vertical roots
  const projectTracks = useMemo(() => {
    if (!activeProjectId) return [];
    
    const roots = projectTasks.filter(t => !t.parentTaskIds || t.parentTaskIds.length === 0);
    const tracks: Task[][] = [];
    
    const buildChain = (current: Task, chain: Task[]) => {
      chain.push(current);
      // For simplicity, we find the first child that depends ONLY on this task to continue the primary chain
      const child = projectTasks.find(t => t.parentTaskIds?.includes(current.id));
      if (child && !chain.includes(child)) {
        buildChain(child, chain);
      }
    };

    roots.forEach(root => {
      const chain: Task[] = [];
      buildChain(root, chain);
      tracks.push(chain);
    });

    return tracks;
  }, [projectTasks, activeProjectId]);

  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectColor = activeProject?.color || 'indigo';

  // Fix: Explicitly include 'key' in props type or use React.FC to allow React list reconciliation props
  const TaskCard = ({ task, isFirst, isLast }: { task: Task, isFirst: boolean, isLast: boolean, key?: React.Key }) => {
    const isLocked = task.parentTaskIds && task.parentTaskIds.length > 0 
      ? task.parentTaskIds.some(pid => tasks.find(pt => pt.id === pid)?.status !== TaskStatus.COMPLETED)
      : false;
    const isCompleted = task.status === TaskStatus.COMPLETED;

    return (
      <div className="flex items-center">
        <div className={`
          w-[260px] min-h-[160px] p-5 rounded-[2rem] bg-white dark:bg-slate-900 border-2 transition-all duration-500 relative flex flex-col shadow-sm hover:shadow-xl group/card
          ${isCompleted ? 'border-emerald-500/30 bg-emerald-50/[0.02]' : isLocked ? 'border-slate-100 dark:border-slate-800 opacity-60' : 'border-indigo-50 dark:border-indigo-900/30 hover:border-indigo-400 hover:-translate-y-1'}
        `}>
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg ${isCompleted ? 'bg-emerald-50 text-emerald-600' : isLocked ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50 text-indigo-600'} text-[8px] font-black uppercase tracking-widest border border-current/10`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : isLocked ? 'bg-slate-300' : 'bg-indigo-500 animate-pulse'}`} />
              {isCompleted ? 'DONE' : isLocked ? 'LOCKED' : 'READY'}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
              <button onClick={() => setEditingTask(task)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => onDeleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          
          <h5 className="text-sm font-black text-slate-800 dark:text-white mb-1 leading-tight tracking-tight">{task.title}</h5>
          <p className="text-slate-400 text-[10px] mb-3 line-clamp-2 font-medium leading-relaxed">{task.description || (language === 'zh' ? '点击进行详情管理' : 'Click to manage details')}</p>
          
          <div className="mt-auto flex items-center justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
             <div className="flex items-center gap-1">
               <Flag className="w-3 h-3 text-indigo-400" />
               <span>{task.milestones?.length || 0}</span>
             </div>
          </div>
        </div>
        
        {!isLast ? (
          <div className="flex items-center justify-center px-8">
             <div className="relative flex items-center">
                <div className={`w-8 h-1 bg-gradient-to-r from-${projectColor}-500/20 to-${projectColor}-500/80 shadow-[0_0_8px_rgba(99,102,241,0.2)]`} />
                <div className={`relative z-10 w-8 h-8 rounded-xl bg-${projectColor}-600 flex items-center justify-center shadow-lg shadow-${projectColor}-500/20 border-2 border-white dark:border-slate-800 mx-[-16px]`}>
                   <ChevronRight className="w-5 h-5 text-white" />
                </div>
                <div className={`w-8 h-1 bg-gradient-to-l from-${projectColor}-500/20 to-${projectColor}-500/80 shadow-[0_0_8px_rgba(99,102,241,0.2)]`} />
             </div>
          </div>
        ) : (
          <div className="flex items-center justify-center px-8">
             <div className="relative flex items-center">
                <div className={`w-8 h-1 bg-gradient-to-r from-${projectColor}-500/20 to-${projectColor}-500/80 shadow-[0_0_8px_rgba(99,102,241,0.2)]`} />
                <button
                   onClick={() => {
                     setNewTask({ title: '', description: '', parentTaskIds: [task.id] });
                     setIsAddingTaskToProject(task.id);
                   }}
                   className={`relative z-10 w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border-2 border-dashed border-${projectColor}-300 hover:border-${projectColor}-500 flex items-center justify-center shadow-sm hover:scale-110 hover:shadow-md transition-all mx-[-16px] group/add-btn`}
                   title={language === 'zh' ? '添加后续节点' : 'Add next step'}
                >
                   <Plus className={`w-4 h-4 text-${projectColor}-400 group-hover/add-btn:text-${projectColor}-600`} />
                </button>
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full gap-4 animate-in fade-in duration-500 relative max-w-6xl mx-auto overflow-hidden">
      {!activeProjectId ? (
        <div className="flex flex-col h-full overflow-hidden">
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

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-6">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] mx-4">
                <Target className="w-16 h-16 text-slate-200 mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">{language === 'zh' ? '暂无项目，点击上方按钮开启' : 'No projects yet. Click above to start.'}</p>
              </div>
            ) : (
              displayedProjects.map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const doneCount = projectTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
                const progress = projectTasks.length > 0 
                  ? Math.round((doneCount / projectTasks.length) * 100) 
                  : 0;
                
                const nextTask = projectTasks.find(t => t.status !== TaskStatus.COMPLETED);
                
                return (
                  <div 
                    key={project.id} 
                    onClick={() => setActiveProjectId(project.id)}
                    className="group relative flex flex-col md:flex-row items-stretch gap-6 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-500/20 transition-all cursor-pointer mx-2"
                  >
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
                      </div>
                    </div>

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
          
          {totalPages > 1 && (
            <div className="shrink-0 flex items-center justify-center gap-4 py-4 mt-2">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">{currentPage}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ {totalPages}</span>
                </div>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-full animate-in fade-in duration-500 w-full overflow-hidden px-2">
           <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-4 w-full bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setActiveProjectId(null)}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:scale-110 active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-1 truncate">{activeProject?.name}</h3>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <Badge color={projectColor} className="text-[8px] font-black uppercase tracking-widest">{activeProject?.color}</Badge>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] opacity-70 truncate max-w-sm">{activeProject?.description}</p>
                    </div>
                    {/* Schedule Info */}
                    {(activeProject?.startDate || activeProject?.schedule) && (
                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold mt-1">
                            {activeProject.startDate && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3 text-indigo-400" />
                                    <span>{activeProject.startDate} {activeProject.endDate ? `- ${activeProject.endDate}` : ''}</span>
                                </div>
                            )}
                            {activeProject.schedule && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-emerald-400" />
                                    <span className="uppercase">
                                        {activeProject.schedule.type === 'daily' 
                                            ? t.everyDay 
                                            : activeProject.schedule.days?.map(d => t.days[d]).join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                  {activeProject && (
                      <>
                        <button 
                            onClick={() => setEditingProject(activeProject)}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 active:scale-95"
                            title="Edit Project"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleExportProject(activeProject)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 active:scale-95"
                            title={t.exportProject}
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t.exportProject}</span>
                        </button>
                      </>
                  )}
              </div>
           </div>

           <div className="flex-1 w-full overflow-y-auto custom-scrollbar pr-1 flex flex-col">
                <div className="space-y-12 pb-16 pt-4 min-w-max">
                   {projectTracks.map((track, trackIdx) => (
                     <div key={trackIdx} className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 px-4">
                           <div className={`w-1.5 h-4 rounded-full bg-${projectColor}-500 opacity-50`} />
                           <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">{language === 'zh' ? `工作流支线 ${trackIdx + 1}` : `Stream ${trackIdx + 1}`}</h4>
                        </div>
                        <div className="flex items-center px-4">
                           {track.map((task, stepIdx) => (
                             <TaskCard 
                               key={task.id} 
                               task={task} 
                               isFirst={stepIdx === 0} 
                               isLast={stepIdx === track.length - 1} 
                             />
                           ))}
                        </div>
                     </div>
                   ))}

                   {/* Add Start Node Card */}
                   <div className="flex flex-col gap-4">
                        {projectTracks.length > 0 && (
                            <div className="flex items-center gap-4 px-4 opacity-40">
                                <div className={`w-1.5 h-4 rounded-full bg-slate-300 dark:bg-slate-700`} />
                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">{language === 'zh' ? '新工作流' : 'New Stream'}</h4>
                            </div>
                        )}
                        <div className="px-4">
                            <button
                                onClick={() => {
                                    setNewTask({ title: '', description: '', parentTaskIds: [] });
                                    setIsAddingRoot(true);
                                }}
                                className="w-[260px] min-h-[160px] rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 flex flex-col items-center justify-center gap-4 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-500 transition-colors">{language === 'zh' ? '添加起始节点' : 'Add Starting Node'}</span>
                            </button>
                        </div>
                   </div>
                </div>
           </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
              <form onSubmit={handleEditProjectSubmit} className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight uppercase shrink-0">Edit Project</h3>
                  <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 -mr-2 flex-1">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.projectName}</label>
                          <input required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-sm shadow-inner transition-all" value={editingProject.name} onChange={(e) => setEditingProject({...editingProject, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.description}</label>
                          <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm h-24 resize-none shadow-inner transition-all leading-relaxed" value={editingProject.description || ''} onChange={(e) => setEditingProject({...editingProject, description: e.target.value})} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.startDate}</label>
                           <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-xs shadow-inner" value={editingProject.startDate || ''} onChange={(e) => setEditingProject({...editingProject, startDate: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.endDate}</label>
                           <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-xs shadow-inner" value={editingProject.endDate || ''} onChange={(e) => setEditingProject({...editingProject, endDate: e.target.value})} />
                        </div>
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.schedule}</label>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-4">
                             <div className="flex gap-4">
                                <button 
                                  type="button" 
                                  onClick={() => setEditingProject({...editingProject, schedule: { ...editingProject.schedule, type: 'daily', days: undefined }})}
                                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${(!editingProject.schedule || editingProject.schedule.type === 'daily') ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                                >
                                  {t.everyDay}
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => setEditingProject({...editingProject, schedule: { ...editingProject.schedule, type: 'weekly', days: editingProject.schedule?.days || [] }})}
                                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${editingProject.schedule?.type === 'weekly' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                                >
                                  {t.specificDays}
                                </button>
                             </div>
                             
                             {editingProject.schedule?.type === 'weekly' && (
                               <div className="flex justify-between gap-1 pt-2">
                                 {DAYS_OF_WEEK.map(day => (
                                   <button
                                     key={day}
                                     type="button"
                                     onClick={() => toggleEditDaySelection(day)}
                                     className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${editingProject.schedule?.days?.includes(day) ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                   >
                                     {t.days[day]}
                                   </button>
                                 ))}
                               </div>
                             )}
                          </div>
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2">{t.themeColor}</label>
                          <div className="flex flex-wrap gap-4 pl-1">
                              {TAG_COLORS.map(c => (
                                  <button type="button" key={c} onClick={() => setEditingProject({...editingProject, color: c})} className={`w-10 h-10 rounded-xl bg-${c}-500 border-2 transition-all ${editingProject.color === c ? 'border-white dark:border-slate-700 scale-110 shadow-lg ring-2 ring-current/20' : 'border-transparent opacity-60 hover:opacity-100'}`} />
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-8 shrink-0 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <Button type="button" variant="ghost" className="rounded-2xl px-8 py-3.5" onClick={() => setEditingProject(null)}>{t.cancel}</Button>
                      <Button type="submit" className="rounded-2xl px-12 py-3.5 shadow-lg shadow-indigo-500/10 font-black text-base">Save Changes</Button>
                  </div>
              </form>
          </div>
      )}

      {/* Form Modals */}
      {(isAddingTaskToProject || isAddingRoot) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
              <form onSubmit={handleTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                        {isAddingRoot ? (language === 'zh' ? '添加起始节点' : 'New Start Node') : t.addStep}
                      </h3>
                      <button type="button" onClick={() => { setIsAddingTaskToProject(null); setIsAddingRoot(false); }} className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-8">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.stepName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-sm shadow-inner" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                      </div>
                      
                      {!isAddingRoot && newTask.parentTaskIds.length > 0 && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                           <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1">{language === 'zh' ? '紧跟在之后:' : 'Follows:'}</p>
                           <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                             {projectTasks.find(pt => pt.id === newTask.parentTaskIds[0])?.title}
                           </p>
                        </div>
                      )}
                  </div>
                  <div className="flex justify-end gap-4 mt-10">
                      <Button type="button" variant="ghost" className="rounded-2xl px-8 py-3.5" onClick={() => { setIsAddingTaskToProject(null); setIsAddingRoot(false); }}>{t.cancel}</Button>
                      <Button type="submit" className="rounded-2xl px-12 py-3.5 shadow-lg shadow-indigo-500/10 font-black text-base">{t.add}</Button>
                  </div>
              </form>
          </div>
      )}

      {editingTask && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
              <form onSubmit={handleUpdateTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 shrink-0">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{language === 'zh' ? '管理任务' : 'Manage Step'}</h3>
                      <button type="button" onClick={() => setEditingTask(null)} className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all"><X className="w-6 h-6" /></button>
                  </div>
                  
                  {/* Scrollable Content */}
                  <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 -mr-2 flex-1">
                      
                      {/* Title */}
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.stepName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-sm shadow-inner" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} />
                      </div>

                      {/* Tags */}
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{language === 'zh' ? '标签' : 'Tags'}</label>
                          <div className="flex flex-wrap gap-2 mb-3 px-1 min-h-[32px]">
                              {(editingTask.tags || []).length === 0 && <span className="text-xs text-slate-300 italic py-1">{language === 'zh' ? '无标签' : 'No tags'}</span>}
                              {(editingTask.tags || []).map(tag => (
                                  <Badge 
                                    key={tag} 
                                    color={categories.find(c => c.name === tag)?.color || 'slate'} 
                                    className="cursor-pointer hover:opacity-80 pr-1 py-1"
                                    onClick={() => setEditingTask({ ...editingTask, tags: editingTask.tags.filter(t => t !== tag) })}
                                  >
                                      {tag} <X className="w-3 h-3 ml-1" />
                                  </Badge>
                              ))}
                          </div>
                          <div className="flex flex-wrap gap-2 px-1">
                              {categories.filter(c => !(editingTask.tags || []).includes(c.name)).map(c => (
                                  <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => setEditingTask({ ...editingTask, tags: [...(editingTask.tags || []), c.name] })}
                                      className={`px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50 text-[10px] font-bold text-slate-500 hover:bg-${c.color}-50 dark:hover:bg-${c.color}-900/20 hover:text-${c.color}-600 transition-all flex items-center gap-1.5`}
                                  >
                                      <div className={`w-1.5 h-1.5 rounded-full bg-${c.color}-500`} />
                                      {c.name}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Milestones */}
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{language === 'zh' ? '里程碑' : 'Milestones'}</label>
                          <div className="space-y-2 mb-3">
                              {(editingTask.milestones || []).map(m => (
                                  <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                                      <div className="flex items-center gap-3">
                                         <Flag className="w-3 h-3 text-indigo-400" />
                                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{m.title}</span>
                                      </div>
                                      <button
                                          type="button"
                                          onClick={() => setEditingTask({ ...editingTask, milestones: editingTask.milestones.filter(x => x.id !== m.id) })}
                                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              ))}
                          </div>
                          <div className="relative">
                            <input 
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-500/10 text-xs font-bold shadow-inner pr-10"
                                placeholder={language === 'zh' ? '输入新里程碑并回车...' : 'Type new milestone & Enter...'}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = (e.target as HTMLInputElement).value.trim();
                                        if (val) {
                                            const newM = {
                                                id: Math.random().toString(36).substr(2, 9),
                                                title: val,
                                                timestamp: Date.now(),
                                                branch: 'main'
                                            };
                                            setEditingTask({ ...editingTask, milestones: [...(editingTask.milestones || []), newM] });
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }
                                }}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                               <Plus className="w-4 h-4" />
                            </div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end gap-4 mt-8 shrink-0 border-t border-slate-100 dark:border-slate-800 pt-6">
                      <Button type="button" variant="ghost" className="rounded-2xl px-8 py-3.5" onClick={() => setEditingTask(null)}>{t.cancel}</Button>
                      <Button type="submit" className="rounded-2xl px-12 py-3.5 shadow-lg shadow-indigo-500/10 font-black text-base tracking-wide">{language === 'zh' ? '保存更改' : 'Save Changes'}</Button>
                  </div>
              </form>
          </div>
      )}

      {isCreatingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in">
              <form onSubmit={handleProjectSubmit} className="bg-white dark:bg-slate-900 w-full max-w-lg p-8 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight uppercase shrink-0">{t.createProject}</h3>
                  <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 -mr-2 flex-1">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.projectName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-sm shadow-inner transition-all" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.description}</label>
                          <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm h-24 resize-none shadow-inner transition-all leading-relaxed" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.startDate}</label>
                           <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-xs shadow-inner" value={newProject.startDate} onChange={(e) => setNewProject({...newProject, startDate: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.endDate}</label>
                           <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-xs shadow-inner" value={newProject.endDate} onChange={(e) => setNewProject({...newProject, endDate: e.target.value})} />
                        </div>
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2">{t.schedule}</label>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-4">
                             <div className="flex gap-4">
                                <button 
                                  type="button" 
                                  onClick={() => setNewProject({...newProject, scheduleType: 'daily'})}
                                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${newProject.scheduleType === 'daily' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                                >
                                  {t.everyDay}
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => setNewProject({...newProject, scheduleType: 'weekly'})}
                                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${newProject.scheduleType === 'weekly' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}
                                >
                                  {t.specificDays}
                                </button>
                             </div>
                             
                             {newProject.scheduleType === 'weekly' && (
                               <div className="flex justify-between gap-1 pt-2">
                                 {DAYS_OF_WEEK.map(day => (
                                   <button
                                     key={day}
                                     type="button"
                                     onClick={() => toggleDaySelection(day)}
                                     className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${newProject.selectedDays.includes(day) ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                   >
                                     {t.days[day]}
                                   </button>
                                 ))}
                               </div>
                             )}
                          </div>
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
                  <div className="flex justify-end gap-4 mt-8 shrink-0 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <Button type="button" variant="ghost" className="rounded-2xl px-8 py-3.5" onClick={() => setIsCreatingProject(false)}>{t.cancel}</Button>
                      <Button type="submit" className="rounded-2xl px-12 py-3.5 shadow-lg shadow-indigo-500/10 font-black text-base">{t.createProject}</Button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
};
