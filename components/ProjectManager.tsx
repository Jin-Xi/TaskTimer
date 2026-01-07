import React, { useState } from 'react';
import { Plus, FolderPlus, Trash2, ChevronRight, List, Network, Pencil, X, Check, ArrowLeft, ExternalLink, Info } from 'lucide-react';
import { Project, Task, TaskStatus } from '../types';
import { TAG_COLORS, TRANSLATIONS } from '../constants';
import { Button } from './Button';
import { ProjectGraph } from './ProjectGraph';

interface ProjectManagerProps {
  language: 'en' | 'zh';
  projects: Project[];
  tasks: Task[];
  onAddProject: (name: string, description: string, color: string) => void;
  onDeleteProject: (id: string) => void;
  onAddTask: (title: string, description: string, tags: string[], projectId?: string, parentTaskIds?: string[]) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  language,
  projects, 
  tasks, 
  onAddProject, 
  onDeleteProject, 
  onAddTask,
  onDeleteTask,
  onUpdateTask
}) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: 'indigo' });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isAddingTaskToProject, setIsAddingTaskToProject] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', parentTaskIds: [] as string[] });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewModes, setViewModes] = useState<Record<string, 'list' | 'graph'>>({});

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
      onAddTask(newTask.title.trim(), newTask.description, ['Project'], isAddingTaskToProject, newTask.parentTaskIds);
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
        parentTaskIds: editingTask.parentTaskIds
      });
      setEditingTask(null);
    }
  };

  const toggleDependency = (taskId: string, list: string[]) => {
    return list.includes(taskId) ? list.filter(id => id !== taskId) : [...list, taskId];
  };

  const toggleViewMode = (projectId: string) => {
    setViewModes(prev => ({
      ...prev,
      [projectId]: prev[projectId] === 'graph' ? 'list' : 'graph'
    }));
  };

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeProjectTasks = tasks.filter(t => t.projectId === activeProjectId);
  const activeViewMode = activeProjectId ? (viewModes[activeProjectId] || 'list') : 'list';

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.projectPlanner}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.projectPlannerDesc}</p>
        </div>
        <Button onClick={() => setIsCreatingProject(true)} className="shadow-lg shadow-indigo-500/20">
          <FolderPlus className="w-4 h-4 mr-2" />
          {t.newProject}
        </Button>
      </div>

      {/* Main Project List View */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {projects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <FolderPlus className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">{language === 'zh' ? '暂无项目' : 'No projects yet'}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xs">{language === 'zh' ? '创建一个项目来定义复杂的流程和任务依赖。' : 'Create a project to define complex workflows and task dependencies.'}</p>
          </div>
        ) : (
          projects.map(project => (
            <div 
              key={project.id} 
              onClick={() => setActiveProjectId(project.id)}
              className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-900 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-12 rounded-full bg-${project.color}-500`} />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-md">
                    {project.description || (language === 'zh' ? '无描述' : 'No description')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-4 hidden sm:block">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{language === 'zh' ? '步骤数' : 'Steps'}</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {tasks.filter(t => t.projectId === project.id).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-all">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} 
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Operation Modal (The Popup Interface) - Now Absolute to container */}
      {activeProjectId && activeProject && (
        <div className="absolute inset-0 z-[50] flex items-center justify-center p-2 md:p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full h-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className={`h-2 flex-shrink-0 bg-${activeProject.color}-500`} />
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveProjectId(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {activeProject.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{activeProject.description || t.projectPlannerDesc}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  <button 
                    onClick={() => toggleViewMode(activeProject.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeViewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                  >
                    <List className="w-4 h-4" />
                    {t.listView}
                  </button>
                  <button 
                    onClick={() => toggleViewMode(activeProject.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeViewMode === 'graph' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                  >
                    <Network className="w-4 h-4" />
                    {t.graphView}
                  </button>
                </div>
                <Button size="sm" onClick={() => setIsAddingTaskToProject(activeProject.id)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.addStep}
                </Button>
                <button onClick={() => setActiveProjectId(null)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeViewMode === 'graph' ? (
                <div className="h-full min-h-[400px]">
                  <ProjectGraph tasks={activeProjectTasks} color={activeProject.color} />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.workflowSteps}</h4>
                    <span className="text-[10px] text-slate-400">{activeProjectTasks.length} {language === 'zh' ? '个步骤' : 'Steps'}</span>
                  </div>

                  {activeProjectTasks.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                       <p className="text-slate-400 italic text-sm">{language === 'zh' ? '暂无工作流步骤，点击上方“添加项目步骤”开始定义流程。' : 'No workflow steps yet. Click "Add Project Step" to define your process.'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                      {activeProjectTasks.map(task => (
                        <div key={task.id} className="relative flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`shrink-0 w-2 h-2 rounded-full ${task.status === TaskStatus.COMPLETED ? 'bg-green-500' : 'bg-indigo-500 animate-pulse'}`} />
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{task.title}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingTask(task)} className="p-1.5 text-slate-400 hover:text-indigo-500 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button onClick={() => onDeleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          {task.parentTaskIds && task.parentTaskIds.length > 0 && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap mt-1 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                              <ChevronRight className="w-3 h-3 text-indigo-500" />
                              <span className="font-medium">{t.dependsOn}</span>
                              {task.parentTaskIds.map(pid => (
                                <span key={pid} className="px-1.5 py-0.5 rounded bg-slate-200/50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400">
                                  {activeProjectTasks.find(pt => pt.id === pid)?.title || "..."}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Tips */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/30 flex items-center gap-3 flex-shrink-0">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">{t.workflowTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Forms & Modals (Absolute to right pane) */}
      {isCreatingProject && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
              <form onSubmit={handleProjectSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">{t.createProject}</h3>
                  <div className="space-y-5">
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.projectName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.description}</label>
                          <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none transition-all" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">{t.themeColor}</label>
                          <div className="flex flex-wrap gap-2.5">
                              {TAG_COLORS.map(c => (
                                  <button type="button" key={c} onClick={() => setNewProject({...newProject, color: c})} className={`w-9 h-9 rounded-full bg-${c}-500 border-4 transition-all ${newProject.color === c ? 'border-white dark:border-slate-700 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`} />
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-10">
                      <Button type="button" variant="ghost" onClick={() => setIsCreatingProject(false)}>{t.cancel}</Button>
                      <Button type="submit">{t.createProject}</Button>
                  </div>
              </form>
          </div>
      )}

      {isAddingTaskToProject && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
              <form onSubmit={handleTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t.addStep}</h3>
                      <button type="button" onClick={() => setIsAddingTaskToProject(null)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-5">
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.stepName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.dependsOn}</label>
                          <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 custom-scrollbar">
                             {tasks.filter(t => t.projectId === isAddingTaskToProject).length === 0 ? (
                               <p className="text-xs text-slate-400 p-2 italic">{t.noDependency}</p>
                             ) : (
                               tasks.filter(t => t.projectId === isAddingTaskToProject).map(pt => (
                                 <button
                                   key={pt.id}
                                   type="button"
                                   onClick={() => setNewTask({...newTask, parentTaskIds: toggleDependency(pt.id, newTask.parentTaskIds)})}
                                   className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-all ${newTask.parentTaskIds.includes(pt.id) ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                                 >
                                   <div className={`w-4 h-4 rounded border flex items-center justify-center ${newTask.parentTaskIds.includes(pt.id) ? 'border-white bg-white/20' : 'border-slate-300 dark:border-slate-600'}`}>
                                      {newTask.parentTaskIds.includes(pt.id) && <Check className="w-3 h-3 text-white" />}
                                   </div>
                                   <span className="truncate">{pt.title}</span>
                                 </button>
                               ))
                             )}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-10">
                      <Button type="button" variant="ghost" onClick={() => setIsAddingTaskToProject(null)}>{t.cancel}</Button>
                      <Button type="submit">{t.add}</Button>
                  </div>
              </form>
          </div>
      )}

      {editingTask && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
              <form onSubmit={handleUpdateTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{language === 'zh' ? '编辑步骤' : 'Edit Step'}</h3>
                      <button type="button" onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-5">
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.stepName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.dependsOn}</label>
                          <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 custom-scrollbar">
                             {tasks.filter(t => t.projectId === editingTask.projectId && t.id !== editingTask.id).map(pt => (
                               <button
                                 key={pt.id}
                                 type="button"
                                 onClick={() => setEditingTask({...editingTask, parentTaskIds: toggleDependency(pt.id, editingTask.parentTaskIds)})}
                                 className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-all ${editingTask.parentTaskIds.includes(pt.id) ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                               >
                                 <div className={`w-4 h-4 rounded border flex items-center justify-center ${editingTask.parentTaskIds.includes(pt.id) ? 'border-white bg-white/20' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {editingTask.parentTaskIds.includes(pt.id) && <Check className="w-3 h-3 text-white" />}
                                 </div>
                                 <span className="truncate">{pt.title}</span>
                               </button>
                             ))}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-10">
                      <Button type="button" variant="ghost" onClick={() => setEditingTask(null)}>{t.cancel}</Button>
                      <Button type="submit">{language === 'zh' ? '保存更改' : 'Save Changes'}</Button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
};
