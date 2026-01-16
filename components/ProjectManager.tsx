
import React, { useState, useMemo } from 'react';
import { Plus, FolderPlus, Trash2, ChevronRight, List, Pencil, X, Check, ArrowLeft, Info, Layers, Flag, Tag as TagIcon, PlusCircle } from 'lucide-react';
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
  const [newTask, setNewTask] = useState({ title: '', description: '', parentTaskIds: [] as string[], tags: [] as string[] });
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
      const finalTags = newTask.tags.length > 0 ? newTask.tags : ['Project'];
      onAddTask(newTask.title.trim(), newTask.description, finalTags, isAddingTaskToProject, newTask.parentTaskIds);
      setNewTask({ title: '', description: '', parentTaskIds: [], tags: [] });
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
        tags: editingTask.tags,
        milestones: editingTask.milestones
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

  const toggleTag = (tagName: string, currentTags: string[]) => {
    return currentTags.includes(tagName) 
      ? currentTags.filter(t => t !== tagName) 
      : [...currentTags, tagName];
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

  return (
    <div className="flex flex-col w-full h-full gap-8 animate-in fade-in duration-500 relative max-w-7xl mx-auto">
      {!activeProjectId ? (
        <>
          <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex-1">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{t.projectPlanner}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg mt-3 leading-relaxed max-w-2xl font-medium opacity-80">
                  {t.projectPlannerDesc}
                </p>
            </div>
            <div className="flex shrink-0">
              <Button onClick={() => setIsCreatingProject(true)} className="w-full md:w-auto shadow-2xl shadow-indigo-500/20 py-5 px-10 rounded-[2rem] text-lg font-black tracking-wide">
                <Plus className="w-6 h-6 mr-3" />
                {t.newProject}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {projects.length === 0 ? (
              <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3.5rem] bg-slate-50/30">
                <FolderPlus className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm">{language === 'zh' ? '开启您的第一个项目' : 'Start your first project'}</p>
              </div>
            ) : (
              projects.map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const progress = projectTasks.length > 0 
                  ? Math.round((projectTasks.filter(t => t.status === TaskStatus.COMPLETED).length / projectTasks.length) * 100) 
                  : 0;
                
                return (
                  <div 
                    key={project.id} 
                    onClick={() => setActiveProjectId(project.id)}
                    className="group bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 md:p-10 shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.04)] hover:border-indigo-500/30 transition-all cursor-pointer flex flex-col gap-8"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-6 min-w-0">
                        <div className={`shrink-0 w-4 h-20 rounded-full bg-${project.color}-500 shadow-xl shadow-${project.color}-500/20`} />
                        <div className="min-w-0">
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                            {project.name}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-2 truncate font-medium">
                            {project.description}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} 
                        className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
                        <span className="text-indigo-500/80">{progress}% {t.stepsCompleted}</span>
                        <span>{projectTasks.length} {t.listView}</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full bg-${project.color}-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full animate-in fade-in duration-500 w-full pb-20">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 w-full bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setActiveProjectId(null)}
                  className="p-4 md:p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:scale-110 active:scale-95"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-2 truncate">{activeProject?.name}</h3>
                  <p className="text-slate-400 text-sm font-black uppercase tracking-[0.4em] opacity-70">{activeProject?.description}</p>
                </div>
              </div>
              <Button onClick={() => setIsAddingTaskToProject(activeProjectId)} className="rounded-[2rem] px-10 py-5 text-base md:text-lg shadow-2xl shadow-indigo-500/20 font-black">
                <Plus className="w-6 h-6 mr-3" />
                {t.addStep}
              </Button>
           </div>

           <div className="flex-1 w-full">
              <div className="flex items-center gap-5 mb-10 px-4">
                <div className={`w-2 h-8 rounded-full bg-${activeProject?.color}-500 shadow-xl shadow-${activeProject?.color}-500/30`} />
                <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em]">{t.workflowSteps}</h4>
                <div className="flex-1 h-[2px] bg-slate-100 dark:bg-slate-800/50 ml-6" />
                <span className="text-[11px] font-black text-indigo-500 tracking-[0.3em] bg-indigo-50 dark:bg-indigo-950/40 px-5 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">{tasks.filter(t => t.projectId === activeProjectId && t.status === TaskStatus.COMPLETED).length} / {orderedProjectTasks.length} DONE</span>
              </div>

              {/* Improved responsive container with better padding to prevent border cutting */}
              <div className="overflow-x-auto custom-scrollbar pb-16 pt-8 w-full -mx-4 px-4">
                <div className="flex items-stretch gap-10 min-w-max pb-4">
                  {orderedProjectTasks.length === 0 ? (
                    <div className="w-full py-32 text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3.5rem] bg-slate-50/30 flex flex-col items-center justify-center min-w-[400px]">
                       <Layers className="w-16 h-16 text-slate-200 mb-6" />
                       <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-sm">{t.createTaskHint}</p>
                    </div>
                  ) : (
                    orderedProjectTasks.map((task, idx) => {
                      const isLocked = task.parentTaskIds && task.parentTaskIds.length > 0 
                        ? task.parentTaskIds.some(pid => tasks.find(pt => pt.id === pid)?.status !== TaskStatus.COMPLETED)
                        : false;
                      const isCompleted = task.status === TaskStatus.COMPLETED;

                      return (
                        <div key={task.id} className="flex items-center group/card">
                          <div className={`
                            w-[380px] p-10 rounded-[3.5rem] bg-white dark:bg-slate-900 border-2 transition-all duration-500 relative flex flex-col shadow-sm group-hover/card:shadow-[0_30px_70px_rgba(0,0,0,0.06)]
                            ${isCompleted ? 'border-emerald-500/40 bg-emerald-50/[0.03] shadow-[0_10px_30px_rgba(16,185,129,0.05)]' : isLocked ? 'border-slate-100 dark:border-slate-800 opacity-60 grayscale-[0.5]' : 'border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-500 hover:-translate-y-2'}
                          `}>
                            <div className="flex items-center justify-between mb-8">
                              <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl ${isCompleted ? 'bg-emerald-100/50 text-emerald-600' : isLocked ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'} text-[10px] font-black uppercase tracking-widest border border-current/10`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-emerald-500' : isLocked ? 'bg-slate-300' : 'bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]'}`} />
                                {isCompleted ? 'COMPLETED' : isLocked ? 'LOCKED' : 'READY'}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <button onClick={() => setEditingTask(task)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"><Pencil className="w-5 h-5" /></button>
                                <button onClick={() => onDeleteTask(task.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                              </div>
                            </div>
                            
                            <h5 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-4 leading-snug tracking-tight">{task.title}</h5>
                            <p className="text-slate-400 text-sm mb-8 line-clamp-2 italic font-medium leading-relaxed">{task.description || (language === 'zh' ? '暂无详细描述' : 'No description provided')}</p>
                            
                            <div className="flex flex-wrap gap-2.5 mb-8">
                               {(task.tags || []).map(tag => (
                                 <Badge key={tag} color={categories.find(c => c.name === tag)?.color || 'slate'} className="text-[10px] py-1.5 px-4 rounded-xl font-black uppercase tracking-widest">{tag}</Badge>
                               ))}
                               <button onClick={() => setEditingTask(task)} className="p-1.5 text-slate-300 hover:text-indigo-500 transition-all hover:scale-125"><PlusCircle className="w-5 h-5" /></button>
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800/60">
                               <div className="flex items-center justify-between mb-5">
                                  <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                    <Flag className="w-4 h-4 text-indigo-400" />
                                    <span>{task.milestones?.length || 0} {language === 'zh' ? '里程碑' : 'Milestones'}</span>
                                  </div>
                                  <button 
                                    onClick={() => setMilestoneTaskId(task.id)}
                                    className="p-2 rounded-xl hover:bg-indigo-50 text-slate-300 hover:text-indigo-500 transition-all shadow-sm border border-transparent hover:border-indigo-100"
                                  >
                                    <Plus className="w-5 h-5" />
                                  </button>
                               </div>
                               <div className="space-y-2">
                                 {task.milestones?.slice(0, 3).map(m => (
                                   <div key={m.id} className="flex items-center gap-3 py-2.5 px-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:translate-x-1">
                                      <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm" />
                                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate tracking-wide">{m.title}</span>
                                   </div>
                                 ))}
                                 {task.milestones?.length > 3 && (
                                   <button onClick={() => setEditingTask(task)} className="text-[10px] font-black text-indigo-500/60 pl-2 tracking-widest uppercase hover:underline">
                                      + {task.milestones.length - 3} More
                                   </button>
                                 )}
                               </div>
                            </div>

                            {task.parentTaskIds?.length > 0 && (
                              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800/40">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                                  <Layers className="w-4 h-4 opacity-40" />
                                  {t.dependsOn}
                                </p>
                                <div className="flex flex-wrap gap-2.5">
                                  {task.parentTaskIds.map(pid => (
                                    <span key={pid} className="text-[10px] px-3 py-1.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/80 text-slate-500 font-bold truncate max-w-[280px] border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                      {tasks.find(t => t.id === pid)?.title}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {idx < orderedProjectTasks.length - 1 && (
                            <div className="w-24 h-[2px] bg-slate-100 dark:bg-slate-800/50 mx-4 relative flex items-center justify-center">
                               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-800/50 rotate-45 transform origin-center border-t-2 border-r-2 border-slate-200 dark:border-slate-700" />
                               <ChevronRight className="w-10 h-10 text-slate-200 dark:text-slate-800/50" />
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
           </div>

           <div className="mt-12 p-8 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-[3rem] flex items-center gap-8 w-full shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-white dark:bg-indigo-900 flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-500/10">
                <Info className="w-8 h-8" />
              </div>
              <div className="max-w-3xl">
                <p className="text-base text-indigo-900 dark:text-indigo-300 font-black leading-tight mb-2 uppercase tracking-[0.2em]">{language === 'zh' ? '工作流贴士' : 'Workflow Tip'}</p>
                <p className="text-sm md:text-base text-indigo-600/80 dark:text-indigo-400/80 font-bold leading-relaxed">{t.workflowTip}</p>
              </div>
           </div>
        </div>
      )}

      {/* Modals remain mostly same but with refined aesthetics */}
      {milestoneTaskId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-10 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 border border-slate-100 dark:border-slate-800">
              <h4 className="text-2xl font-black mb-8 flex items-center gap-4">
                <Flag className="w-8 h-8 text-indigo-500" />
                {t.newMilestone}
              </h4>
              <input 
                autoFocus 
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[1.75rem] px-8 py-6 text-lg outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-black shadow-inner mb-8" 
                placeholder={t.stepName}
                value={newMilestoneTitle} 
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(milestoneTaskId)}
              />
              <div className="flex gap-4">
                 <Button variant="ghost" className="flex-1 rounded-2xl py-4" onClick={() => setMilestoneTaskId(null)}>{t.cancel}</Button>
                 <Button className="flex-1 rounded-2xl py-4 shadow-2xl shadow-indigo-500/20" onClick={() => handleAddMilestone(milestoneTaskId)}>{t.add}</Button>
              </div>
           </div>
        </div>
      )}

      {isCreatingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in">
              <form onSubmit={handleProjectSubmit} className="bg-white dark:bg-slate-900 w-full max-w-2xl p-12 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">{t.createProject}</h3>
                  <div className="space-y-10">
                      <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">{t.projectName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-[2rem] p-6 outline-none focus:ring-8 focus:ring-indigo-500/5 font-black text-base shadow-inner transition-all" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">{t.description}</label>
                          <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-[2rem] p-6 outline-none focus:ring-8 focus:ring-indigo-500/5 font-bold text-base h-40 resize-none shadow-inner transition-all leading-relaxed" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 ml-4">{t.themeColor}</label>
                          <div className="flex flex-wrap gap-5 pl-2">
                              {TAG_COLORS.map(c => (
                                  <button type="button" key={c} onClick={() => setNewProject({...newProject, color: c})} className={`w-14 h-14 rounded-[1.25rem] bg-${c}-500 border-4 transition-all ${newProject.color === c ? 'border-white dark:border-slate-700 scale-110 shadow-2xl ring-4 ring-current/20' : 'border-transparent opacity-60 hover:opacity-100'}`} />
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-6 mt-14">
                      <Button type="button" variant="ghost" className="rounded-2xl px-10 py-5" onClick={() => setIsCreatingProject(false)}>{t.cancel}</Button>
                      <Button type="submit" className="rounded-2xl px-16 py-5 shadow-2xl shadow-indigo-500/20 font-black text-lg">{t.createProject}</Button>
                  </div>
              </form>
          </div>
      )}

      {isAddingTaskToProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in">
              <form onSubmit={handleTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-2xl p-12 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-10">
                      <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{t.addStep}</h3>
                      <button type="button" onClick={() => setIsAddingTaskToProject(null)} className="p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><X className="w-8 h-8" /></button>
                  </div>
                  <div className="space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar pr-4">
                      <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">{t.stepName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-[2rem] p-6 outline-none focus:ring-8 focus:ring-indigo-500/5 font-black text-base shadow-inner" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                      </div>
                      
                      <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 ml-4">{language === 'zh' ? '选择标签' : 'Select Tags'}</label>
                          <div className="flex flex-wrap gap-3 pl-2">
                            {categories.map(cat => (
                              <button
                                key={cat.id} 
                                type="button"
                                onClick={() => setNewTask({...newTask, tags: toggleTag(cat.name, newTask.tags)})}
                                className={`px-6 py-3.5 rounded-2xl border-2 font-black text-[11px] uppercase tracking-widest transition-all ${newTask.tags.includes(cat.name) ? `bg-${cat.color}-100 border-${cat.color}-500 text-${cat.color}-700 shadow-xl shadow-${cat.color}-500/10` : 'border-slate-100 dark:border-slate-800 text-slate-400 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 ml-4">{t.dependsOn}</label>
                          <div className="max-h-64 overflow-y-auto space-y-3 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 custom-scrollbar">
                             {tasks.filter(t => t.projectId === isAddingTaskToProject).length === 0 ? (
                               <div className="p-8 text-center text-slate-300 font-black uppercase tracking-widest text-xs italic">{t.noDependency}</div>
                             ) : (
                               tasks.filter(t => t.projectId === isAddingTaskToProject).map(pt => (
                                 <button
                                   key={pt.id}
                                   type="button"
                                   onClick={() => setNewTask({...newTask, parentTaskIds: toggleDependency(pt.id, newTask.parentTaskIds)})}
                                   className={`w-full flex items-center justify-between p-5 rounded-[1.75rem] font-black text-sm transition-all ${newTask.parentTaskIds.includes(pt.id) ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500 border border-transparent hover:border-slate-100/50'}`}
                                 >
                                   <span className="truncate pr-4">{pt.title}</span>
                                   {newTask.parentTaskIds.includes(pt.id) ? <Check className="w-6 h-6" /> : <Layers className="w-5 h-5 opacity-20" />}
                                 </button>
                               ))
                             )}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-6 mt-14">
                      <Button type="button" variant="ghost" className="rounded-2xl px-10 py-5" onClick={() => setIsAddingTaskToProject(null)}>{t.cancel}</Button>
                      <Button type="submit" className="rounded-2xl px-16 py-5 shadow-2xl shadow-indigo-500/20 font-black text-lg">{t.add}</Button>
                  </div>
              </form>
          </div>
      )}

      {editingTask && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xl animate-in fade-in">
              <form onSubmit={handleUpdateTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-2xl p-12 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-10">
                      <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{language === 'zh' ? '管理任务' : 'Manage Step'}</h3>
                      <button type="button" onClick={() => setEditingTask(null)} className="p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><X className="w-8 h-8" /></button>
                  </div>
                  <div className="space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar pr-4">
                      <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">{t.stepName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800/50 rounded-[2rem] p-6 outline-none focus:ring-8 focus:ring-indigo-500/5 font-black text-base shadow-inner" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} />
                      </div>

                      <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 ml-4">{language === 'zh' ? '管理标签' : 'Manage Tags'}</label>
                          <div className="flex flex-wrap gap-3 pl-2">
                            {categories.map(cat => (
                              <button
                                key={cat.id} 
                                type="button"
                                onClick={() => setEditingTask({...editingTask, tags: toggleTag(cat.name, editingTask.tags)})}
                                className={`px-6 py-3.5 rounded-2xl border-2 font-black text-[11px] uppercase tracking-widest transition-all ${editingTask.tags.includes(cat.name) ? `bg-${cat.color}-100 border-${cat.color}-500 text-${cat.color}-700 shadow-xl shadow-${cat.color}-500/10` : 'border-slate-100 dark:border-slate-800 text-slate-400 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-5 ml-4">
                           <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{language === 'zh' ? '里程碑列表' : 'Milestone List'}</label>
                           <button 
                             type="button" 
                             onClick={() => {
                               const mTitle = prompt(language === 'zh' ? "里程碑标题" : "Milestone title");
                               if (mTitle) {
                                  const newM = { id: Math.random().toString(36).substr(2, 9), title: mTitle, timestamp: Date.now(), branch: 'main' };
                                  setEditingTask({...editingTask, milestones: [...(editingTask.milestones || []), newM]});
                               }
                             }}
                             className="text-indigo-600 text-[11px] font-black uppercase tracking-[0.4em] hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                           >
                             + {t.add}
                           </button>
                        </div>
                        <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800">
                           {(!editingTask.milestones || editingTask.milestones.length === 0) ? (
                             <p className="text-center text-slate-300 py-8 font-black text-xs uppercase italic tracking-widest">{language === 'zh' ? '暂无里程碑' : 'No milestones'}</p>
                           ) : (
                             editingTask.milestones.map(m => (
                               <div key={m.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                                  <div className="flex items-center gap-4">
                                     <Flag className="w-5 h-5 text-indigo-400" />
                                     <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{m.title}</span>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => setEditingTask({...editingTask, milestones: editingTask.milestones.filter(x => x.id !== m.id)})}
                                    className="p-2 text-slate-300 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                               </div>
                             ))
                           )}
                        </div>
                      </div>

                      <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 ml-4">{t.dependsOn}</label>
                          <div className="max-h-64 overflow-y-auto space-y-3 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 custom-scrollbar">
                             {tasks.filter(t => t.projectId === editingTask.projectId && t.id !== editingTask.id).map(pt => (
                               <button
                                 key={pt.id}
                                 type="button"
                                 onClick={() => setEditingTask({...editingTask, parentTaskIds: toggleDependency(pt.id, editingTask.parentTaskIds)})}
                                 className={`w-full flex items-center justify-between p-5 rounded-[1.75rem] font-black text-sm transition-all ${editingTask.parentTaskIds.includes(pt.id) ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500 border border-transparent hover:border-slate-100/50'}`}
                               >
                                 <span className="truncate pr-4">{pt.title}</span>
                                 {editingTask.parentTaskIds.includes(pt.id) ? <Check className="w-6 h-6" /> : <Layers className="w-5 h-5 opacity-20" />}
                               </button>
                             ))}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-6 mt-14">
                      <Button type="button" variant="ghost" className="rounded-2xl px-10 py-5" onClick={() => setEditingTask(null)}>{t.cancel}</Button>
                      <Button type="submit" className="rounded-2xl px-16 py-5 shadow-2xl shadow-indigo-500/20 font-black text-lg tracking-wide">{language === 'zh' ? '保存更改' : 'Save Changes'}</Button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
};
