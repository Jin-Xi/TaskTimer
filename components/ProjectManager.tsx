import React, { useState } from 'react';
import { Plus, FolderPlus, GitBranchPlus, Trash2, ChevronRight, Layout, Info } from 'lucide-react';
import { Project, Task } from '../types';
import { TAG_COLORS, TRANSLATIONS } from '../constants';
import { Button } from './Button';

interface ProjectManagerProps {
  language: 'en' | 'zh';
  projects: Project[];
  tasks: Task[];
  onAddProject: (name: string, description: string, color: string) => void;
  onDeleteProject: (id: string) => void;
  onAddTask: (title: string, description: string, tags: string[], projectId?: string, parentTaskId?: string) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  language,
  projects, 
  tasks, 
  onAddProject, 
  onDeleteProject, 
  onAddTask 
}) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: 'indigo' });
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', parentTaskId: '' });

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 pb-6">
          {projects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              return (
                  <div key={project.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-all hover:shadow-md">
                      <div className={`h-2 w-full bg-${project.color}-500 rounded-t-xl`} />
                      <div className="p-5 flex-1">
                          <div className="flex items-start justify-between mb-4">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{project.name}</h3>
                              <button onClick={() => onDeleteProject(project.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="space-y-2 mb-6">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.workflowSteps}</h4>
                              <div className="space-y-1">
                                  {projectTasks.map(task => (
                                      <div key={task.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 group">
                                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate flex-1">{task.title}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          {isAddingTask === project.id ? (
                              <form onSubmit={(e) => handleTaskSubmit(e, project.id)} className="space-y-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 animate-in slide-in-from-top-1">
                                  <input autoFocus placeholder={t.stepName} className="w-full text-xs p-2 rounded outline-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                                  <select className="w-full text-xs p-2 rounded outline-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" value={newTask.parentTaskId} onChange={(e) => setNewTask({...newTask, parentTaskId: e.target.value})}>
                                      <option value="">{t.noDependency}</option>
                                      {projectTasks.map(pt => <option key={pt.id} value={pt.id}>{t.dependsOn} {pt.title}</option>)}
                                  </select>
                                  <div className="flex justify-end gap-2">
                                      <button type="button" onClick={() => setIsAddingTask(null)} className="text-[10px] text-slate-500">{t.cancel}</button>
                                      <button type="submit" className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded font-bold">{t.add}</button>
                                  </div>
                              </form>
                          ) : (
                              <button onClick={() => setIsAddingTask(project.id)} className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all">
                                  <GitBranchPlus className="w-3.5 h-3.5" />{t.addStep}
                              </button>
                          )}
                      </div>
                  </div>
              )
          })}
      </div>
      <div className="bg-indigo-50 dark:bg-slate-900/50 p-4 rounded-xl border border-indigo-100 dark:border-slate-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{t.workflowTip}</p>
      </div>
    </div>
  );
};