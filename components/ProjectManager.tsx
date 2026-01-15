
import React, { useState } from 'react';
import { Plus, FolderPlus, Trash2, ChevronRight, List, Network, Pencil, X, Check, ArrowLeft, ExternalLink, Info, Tags } from 'lucide-react';
import { Project, Task, TaskStatus, Category } from '../types';
import { TAG_COLORS, TRANSLATIONS, DEFAULT_CATEGORIES } from '../constants';
import { Button } from './Button';
import { Badge } from './Badge';
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
        tags: editingTask.tags
      });
      setEditingTask(null);
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
    <div className="flex flex-col h-full gap-4 md:gap-6 animate-in fade-in duration-300 relative">
      {/* Optimized Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">{t.projectPlanner}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 leading-relaxed">
              {t.projectPlannerDesc}
            </p>
        </div>
        <div className="flex shrink-0">
          <Button onClick={() => setIsCreatingProject(true)} className="w-full sm:w-auto shadow-lg shadow-indigo-500/20 py-2.5 px-4">
            <FolderPlus className="w-4 h-4 mr-2" />
            {t.newProject}
          </Button>
        </div>
      </div>

      {/* Main Project List View */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {projects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <FolderPlus className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">{language === 'zh' ? '暂无项目' : 'No projects yet'}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs">{language === 'zh' ? '创建一个项目来定义复杂的流程和任务依赖。' : 'Create a project to define complex workflows and task dependencies.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {projects.map(project => (
              <div 
                key={project.id} 
                onClick={() => setActiveProjectId(project.id)}
                className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-900 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`shrink-0 w-2 h-10 rounded-full bg-${project.color}-500`} />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {project.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 truncate">
                      {project.description || (language === 'zh' ? '无描述' : 'No description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <div className="text-right hidden sm:block mr-2">
                    <p className="text-[9px] text-slate-400 uppercase font-black">{language === 'zh' ? '步骤' : 'Steps'}</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {tasks.filter(t => t.projectId === project.id).length}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} 
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Operation Modal - Mobile Optimized */}
      {activeProjectId && activeProject && (
        <div className="absolute inset-0 z-[50] flex items-center justify-center p-0 sm:p-4 bg-slate-950/40 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full h-full sm:max-w-5xl sm:h-[90vh] sm:rounded-2xl shadow-2xl border-x sm:border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className={`h-1.5 flex-shrink-0 bg-${activeProject.color}-500`} />
            <div className="px-4 py-4 md:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setActiveProjectId(null)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white truncate">
                    {activeProject.name}
                  </h3>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-tight truncate">{activeProject.description || t.projectPlannerDesc}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
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
                <Button size="sm" onClick={() => setIsAddingTaskToProject(activeProject.id)} className="px-3">
                  <Plus className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">{t.addStep}</span>
                </Button>
                <button onClick={() => setActiveProjectId(null)} className="p-2 text-slate-400 hover:text-slate-600 md:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
              {/* Mobile View Toggles */}
              <div className="flex md:hidden bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
                <button 
                  onClick={() => toggleViewMode(activeProject.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeViewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                >
                  <List className="w-4 h-4" />
                  {t.listView}
                </button>
                <button 
                  onClick={() => toggleViewMode(activeProject.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeViewMode === 'graph' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                >
                  <Network className="w-4 h-4" />
                  {t.graphView}
                </button>
              </div>

              {activeViewMode === 'graph' ? (
                <div className="h-full min-h-[400px]">
                  <ProjectGraph tasks={activeProjectTasks} color={activeProject.color} />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.workflowSteps}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{activeProjectTasks.length} {language === 'zh' ? '项' : 'Steps'}</span>
                  </div>

                  {activeProjectTasks.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                       <p className="text-slate-400 italic text-sm px-10">{language === 'zh' ? '暂无工作流步骤，点击上方“添加项目步骤”开始定义流程。' : 'No workflow steps yet. Click "Add Project Step" to define your process.'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
                      {activeProjectTasks.map(task => (
                        <div key={task.id} className="relative flex flex-col gap-2 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm group hover:border-indigo-300 dark:hover:border-indigo-500 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`shrink-0 w-2.5 h-2.5 rounded-full ${task.status === TaskStatus.COMPLETED ? 'bg-green-500' : 'bg-indigo-500 animate-pulse'}`} />
                              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{task.title}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => setEditingTask(task)} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => onDeleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {(task.tags || []).map(tag => (
                              <Badge key={tag} color={categories.find(c => c.name === tag)?.color || 'slate'} className="text-[9px] py-0.5 px-2">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          {task.parentTaskIds && task.parentTaskIds.length > 0 && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                              <ChevronRight className="w-3 h-3 text-indigo-500" />
                              <span className="font-bold uppercase tracking-tight opacity-70">{t.dependsOn}</span>
                              <div className="flex flex-wrap gap-1">
                                {task.parentTaskIds.map(pid => (
                                  <span key={pid} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium">
                                    {activeProjectTasks.find(pt => pt.id === pid)?.title || "..."}
                                  </span>
                                ))}
                              </div>
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
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900/30 flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">{t.workflowTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Forms & Modals */}
      {isCreatingProject && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40">
              <form onSubmit={handleProjectSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6">{t.createProject}</h3>
                  <div className="space-y-5">
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.projectName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.description}</label>
                          <textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none transition-all text-sm" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">{t.themeColor}</label>
                          <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                              {TAG_COLORS.map(c => (
                                  <button type="button" key={c} onClick={() => setNewProject({...newProject, color: c})} className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-${c}-500 border-4 transition-all ${newProject.color === c ? 'border-white dark:border-slate-700 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`} />
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

      {isAddingTaskToProject && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40">
              <form onSubmit={handleTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{t.addStep}</h3>
                      <button type="button" onClick={() => setIsAddingTaskToProject(null)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-5">
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.stepName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                      </div>
                      
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{language === 'zh' ? '分类/类型' : 'Category / Type'}</label>
                          <div className="flex flex-wrap gap-1.5">
                            {categories.map(cat => (
                              <Badge 
                                key={cat.id} 
                                color={cat.color} 
                                onClick={() => setNewTask({...newTask, tags: toggleTag(cat.name, newTask.tags)})}
                                className={`py-1 px-3 cursor-pointer transition-all ${newTask.tags.includes(cat.name) ? 'ring-2 ring-indigo-500 scale-105 opacity-100 shadow-sm' : 'opacity-50 grayscale-[0.3]'}`}
                              >
                                {cat.name}
                              </Badge>
                            ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.dependsOn}</label>
                          <div className="max-h-32 md:max-h-40 overflow-y-auto space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 custom-scrollbar text-xs">
                             {tasks.filter(t => t.projectId === isAddingTaskToProject).length === 0 ? (
                               <p className="text-slate-400 p-2 italic">{t.noDependency}</p>
                             ) : (
                               tasks.filter(t => t.projectId === isAddingTaskToProject).map(pt => (
                                 <button
                                   key={pt.id}
                                   type="button"
                                   onClick={() => setNewTask({...newTask, parentTaskIds: toggleDependency(pt.id, newTask.parentTaskIds)})}
                                   className={`w-full flex items-center gap-3 p-2 rounded-lg font-medium transition-all ${newTask.parentTaskIds.includes(pt.id) ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                                 >
                                   <div className={`shrink-0 w-3 h-3 rounded border flex items-center justify-center ${newTask.parentTaskIds.includes(pt.id) ? 'border-white bg-white/20' : 'border-slate-300 dark:border-slate-600'}`}>
                                      {newTask.parentTaskIds.includes(pt.id) && <Check className="w-2 h-2 text-white" />}
                                   </div>
                                   <span className="truncate">{pt.title}</span>
                                 </button>
                               ))
                             )}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                      <Button type="button" variant="ghost" onClick={() => setIsAddingTaskToProject(null)}>{t.cancel}</Button>
                      <Button type="submit">{t.add}</Button>
                  </div>
              </form>
          </div>
      )}

      {editingTask && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/40">
              <form onSubmit={handleUpdateTaskSubmit} className="bg-white dark:bg-slate-900 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{language === 'zh' ? '编辑步骤' : 'Edit Step'}</h3>
                      <button type="button" onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-5">
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.stepName}</label>
                          <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} />
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{language === 'zh' ? '分类/类型' : 'Category / Type'}</label>
                          <div className="flex flex-wrap gap-1.5">
                            {categories.map(cat => (
                              <Badge 
                                key={cat.id} 
                                color={cat.color} 
                                onClick={() => setEditingTask({...editingTask, tags: toggleTag(cat.name, editingTask.tags)})}
                                className={`py-1 px-3 cursor-pointer transition-all ${editingTask.tags.includes(cat.name) ? 'ring-2 ring-indigo-500 scale-105 opacity-100 shadow-sm' : 'opacity-50 grayscale-[0.3]'}`}
                              >
                                {cat.name}
                              </Badge>
                            ))}
                          </div>
                      </div>

                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.dependsOn}</label>
                          <div className="max-h-32 md:max-h-40 overflow-y-auto space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 custom-scrollbar text-xs">
                             {tasks.filter(t => t.projectId === editingTask.projectId && t.id !== editingTask.id).map(pt => (
                               <button
                                 key={pt.id}
                                 type="button"
                                 onClick={() => setEditingTask({...editingTask, parentTaskIds: toggleDependency(pt.id, editingTask.parentTaskIds)})}
                                 className={`w-full flex items-center gap-3 p-2 rounded-lg font-medium transition-all ${editingTask.parentTaskIds.includes(pt.id) ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                               >
                                 <div className={`shrink-0 w-3 h-3 rounded border flex items-center justify-center ${editingTask.parentTaskIds.includes(pt.id) ? 'border-white bg-white/20' : 'border-slate-300 dark:border-slate-600'}`}>
                                    {editingTask.parentTaskIds.includes(pt.id) && <Check className="w-2 h-2 text-white" />}
                                 </div>
                                 <span className="truncate">{pt.title}</span>
                               </button>
                             ))}
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                      <Button type="button" variant="ghost" onClick={() => setEditingTask(null)}>{t.cancel}</Button>
                      <Button type="submit">{language === 'zh' ? '保存更改' : 'Save Changes'}</Button>
                  </div>
              </form>
          </div>
      )}
    </div>
  );
};
