
import React, { useState } from 'react';
import { Plus, FolderPlus, GitBranchPlus, Trash2, ChevronRight, Layout, Info, List, Network, Pencil, X } from 'lucide-react';
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
  onAddTask: (title: string, description: string, tags: string[], projectId?: string, parentTaskId?: string) => void;
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
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', parentTaskId: '' });
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

  const handleTaskSubmit = (e: React.FormEvent, projectId: string) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      onAddTask(newTask.title.trim(), newTask.description, ['Project'], projectId, newTask.parentTaskId || undefined);
      setNewTask({ title: '', description: '', parentTaskId: '' });
      setIsAddingTask(null);
    }
  };

  const handleUpdateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask && editingTask.title.trim()) {
      onUpdateTask(editingTask.id, {
        title: editingTask.title.trim(),
        description: editingTask.description,
        parentTaskId: editingTask.parentTaskId || undefined
      });
      setEditingTask(null);
    }
  };

  const toggleViewMode = (projectId: string) => {
    setViewModes(prev => ({
      ...prev,
      [projectId]: prev[projectId] === 'graph' ? 'list' : 'graph'
    }));
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-300">
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

      {isCreatingProject && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <form onSubmit={handleProjectSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.createProject}</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.projectName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.description}</label>
                          <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.themeColor}</label>
                          <div className="flex flex-wrap gap-2">
                              {TAG_COLORS.map(c => (
                                  <button type="button" key={c} onClick={() => setNewProject({...newProject, color: c})} className={`w-8 h-8 rounded-full bg-${c}-500 border-4 transition-all ${newProject.color === c ? 'border-white dark:border-slate-700 scale-110 shadow-lg' : 'border-transparent opacity-60'}`} />
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                      <Button type="button" variant="ghost" onClick={() => setIsCreatingProject(false)}>{t.cancel}</Button>
                      <Button type="submit">{t.createProject}</Button>
                  </div>
              </form>
          </div>
      )}

      {editingTask && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <form onSubmit={handleUpdateTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{language === 'zh' ? '编辑步骤' : 'Edit Step'}</h3>
                      <button type="button" onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.projectName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.description}</label>
                          <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none" value={editingTask.description || ''} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.dependsOn}</label>
                          <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={editingTask.parentTaskId || ''} onChange={(e) => setEditingTask({...editingTask, parentTaskId: e.target.value})}>
                              <option value="">{t.noDependency}</option>
                              {tasks.filter(t => t.projectId === editingTask.projectId && t.id !== editingTask.id).map(pt => (
                                  <option key={pt.id} value={pt.id}>{pt.title}</option>
                              ))}
                          </select>
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                      <Button type="button" variant="ghost" onClick={() => setEditingTask(null)}>{t.cancel}</Button>
                      <Button type="submit">{language === 'zh' ? '保存更改' : 'Save Changes'}</Button>
                  </div>
              </form>
          </div>
      )}

      <div className="grid grid-cols-1 gap-6 flex-1 overflow-y-auto pr-2 pb-6">
          {projects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const viewMode = viewModes[project.id] || 'list';

              return (
                  <div key={project.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-all hover:shadow-md overflow-hidden">
                      <div className={`h-2 w-full bg-${project.color}-500`} />
                      <div className="p-6">
                          <div className="flex items-center justify-between mb-6">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full bg-${project.color}-500`} />
                                  {project.name}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{project.description || "Project workflow summary"}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2">
                                      <button 
                                        onClick={() => toggleViewMode(project.id)}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                                        title={t.listView}
                                      >
                                        <List className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => toggleViewMode(project.id)}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'graph' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                                        title={t.graphView}
                                      >
                                        <Network className="w-4 h-4" />
                                      </button>
                                  </div>
                                  <button onClick={() => onDeleteProject(project.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                          </div>

                          {viewMode === 'graph' ? (
                            <div className="mb-6">
                              <ProjectGraph tasks={projectTasks} color={project.color} />
                            </div>
                          ) : (
                            <div className="space-y-3 mb-6">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.workflowSteps}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {projectTasks.map(task => (
                                        <div key={task.id} className="relative flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 group">
                                            <div className="flex items-center gap-2">
                                              <div className={`w-1.5 h-1.5 rounded-full ${task.status === TaskStatus.COMPLETED ? 'bg-green-500' : 'bg-indigo-500'}`} />
                                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate flex-1">{task.title}</span>
                                            </div>
                                            {task.parentTaskId && (
                                              <div className="text-[9px] text-slate-400 flex items-center gap-1">
                                                <ChevronRight className="w-2.5 h-2.5" />
                                                {t.dependsOn} {projectTasks.find(pt => pt.id === task.parentTaskId)?.title || "..."}
                                              </div>
                                            )}
                                            
                                            {/* Step Actions */}
                                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-800 pl-1">
                                                <button 
                                                  onClick={() => setEditingTask(task)}
                                                  className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"
                                                  title={language === 'zh' ? '编辑' : 'Edit'}
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                                <button 
                                                  onClick={() => onDeleteTask(task.id)}
                                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                  title={language === 'zh' ? '删除' : 'Delete'}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                          )}

                          {isAddingTask === project.id ? (
                              <form onSubmit={(e) => handleTaskSubmit(e, project.id)} className="space-y-3 p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 animate-in slide-in-from-top-1">
                                  <input autoFocus placeholder={t.stepName} className="w-full text-sm p-2.5 rounded-lg outline-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <select className="flex-1 text-sm p-2.5 rounded-lg outline-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500" value={newTask.parentTaskId} onChange={(e) => setNewTask({...newTask, parentTaskId: e.target.value})}>
                                        <option value="">{t.noDependency}</option>
                                        {projectTasks.map(pt => <option key={pt.id} value={pt.id}>{t.dependsOn} {pt.title}</option>)}
                                    </select>
                                    <div className="flex justify-end items-center gap-3">
                                        <button type="button" onClick={() => setIsAddingTask(null)} className="text-xs text-slate-500 font-medium px-2">{t.cancel}</button>
                                        <Button type="submit" size="sm" className="px-6">{t.add}</Button>
                                    </div>
                                  </div>
                              </form>
                          ) : (
                              <button onClick={() => setIsAddingTask(project.id)} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm font-semibold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 transition-all">
                                  <GitBranchPlus className="w-4 h-4" />{t.addStep}
                              </button>
                          )}
                      </div>
                  </div>
              )
          })}
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">{t.workflowTip}</p>
      </div>
    </div>
  );
};
