
import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronRight, Pencil, X, ArrowLeft, Flag, Clock, Target, GitBranchPlus, Download } from 'lucide-react';
import { Project, Task, TaskStatus, Category, DayOfWeek } from '../types';
import { TAG_COLORS, TRANSLATIONS, DEFAULT_CATEGORIES } from '../constants';
import { Button } from './Button';
import { Badge } from './Badge';
import { ProjectGraph } from './ProjectGraph';

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

const getTodayStr = () => new Date().toISOString().split('T')[0];

const ProjectForm = ({ 
  mode, 
  title, 
  data, 
  onChange, 
  onSubmit, 
  onCancel, 
  t, 
  DAYS_OF_WEEK, 
  TAG_COLORS 
}: any) => {
  const scheduleType = data?.schedule?.type || data?.scheduleType || 'daily';
  const selectedDays = data?.schedule?.days || data?.selectedDays || [];

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between px-8 md:px-12 py-8 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-10">
         <div className="flex items-center gap-8">
            <button type="button" onClick={onCancel} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-all active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">{title}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{mode === 'create' ? t.projectPlanner : (data?.name || 'Project Detail')}</p>
            </div>
         </div>
         <Button onClick={onSubmit} className="rounded-2xl px-8 md:px-10 py-4 shadow-xl shadow-indigo-500/20 font-black text-sm md:text-base uppercase tracking-wider shrink-0">
            {mode === 'create' ? t.createProject : 'Save Changes'}
         </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
         <div className="w-full max-w-5xl mx-auto space-y-12">
            <div className="space-y-8">
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{t.projectName}</label>
                  <input 
                    autoFocus 
                    required 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 font-black text-2xl shadow-inner transition-all" 
                    value={data?.name || ''} 
                    onChange={(e) => onChange('name', e.target.value)} 
                    placeholder="e.g. Q4 Marketing Campaign"
                  />
               </div>
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{t.description}</label>
                  <textarea 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 font-medium text-lg h-48 resize-none shadow-inner leading-relaxed" 
                    value={data?.description || ''} 
                    onChange={(e) => onChange('description', e.target.value)} 
                    placeholder="Describe the main goals and deliverables..."
                  />
               </div>
            </div>

            <div>
               <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">Timeline</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-10 bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] border border-slate-100 dark:border-slate-800/50">
                  <div>
                      <label className="flex items-center gap-3 text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-4 ml-1">
                        <Clock className="w-4.5 h-4.5" />
                        {t.startDate}
                      </label>
                      <input 
                          type="date" 
                          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-5 outline-none focus:border-indigo-500 font-black text-base transition-all" 
                          value={data?.startDate || ''} 
                          onChange={(e) => onChange('startDate', e.target.value)} 
                      />
                  </div>
                  <div>
                      <label className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">
                        <Clock className="w-4.5 h-4.5" />
                        {t.endDate}
                      </label>
                      <input 
                          type="date" 
                          className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-5 outline-none focus:border-indigo-500 font-black text-base transition-all" 
                          value={data?.endDate || ''} 
                          onChange={(e) => onChange('endDate', e.target.value)} 
                      />
                  </div>
               </div>
            </div>

            <div>
               <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{t.schedule}</label>
               <div className="bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex gap-3">
                   {['daily', 'weekly'].map(type => (
                       <button
                         key={type}
                         type="button"
                         onClick={() => onChange('scheduleType', type)}
                         className={`flex-1 py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all ${scheduleType === type ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                       >
                         {type === 'daily' ? t.everyDay : t.specificDays}
                       </button>
                   ))}
               </div>
               {scheduleType === 'weekly' && (
                  <div className="flex flex-wrap justify-center gap-4 mt-8 px-2 animate-in slide-in-from-top-2">
                     {DAYS_OF_WEEK.map((day: any) => (
                       <button
                         key={day}
                         type="button"
                         onClick={() => onChange('toggleDay', day)}
                         className={`w-14 h-14 md:w-18 md:h-18 rounded-[1.5rem] text-xs md:text-sm font-black transition-all flex items-center justify-center ${selectedDays.includes(day) ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'}`}
                       >
                         {t.days[day]}
                       </button>
                     ))}
                  </div>
               )}
            </div>

            <div>
               <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">{t.themeColor}</label>
               <div className="flex flex-wrap gap-5 px-2">
                  {TAG_COLORS.map((c: any) => (
                     <button 
                       key={c} 
                       type="button"
                       onClick={() => onChange('color', c)} 
                       className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-${c}-500 transition-all ${data?.color === c ? 'ring-4 ring-offset-4 ring-offset-white dark:ring-offset-slate-900 ring-indigo-500/40 scale-110 shadow-xl' : 'opacity-40 hover:opacity-100 hover:scale-105'}`} 
                     />
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  language, projects, tasks, onAddProject, onUpdateProject, onDeleteProject, onAddTask, onDeleteTask, onUpdateTask, categories = DEFAULT_CATEGORIES 
}) => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isGraphView, setIsGraphView] = useState(false);
  
  // State for task management modals
  const [isAddingTaskToProject, setIsAddingTaskToProject] = useState<string | null>(null);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', parentTaskIds: [] as string[] });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    color: 'indigo',
    startDate: getTodayStr(),
    endDate: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;
  const displayedProjects = useMemo(() => projects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [projects, currentPage]);

  const t = TRANSLATIONS[language];
  const DAYS_OF_WEEK: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleOpenDetail = (id: string) => {
    setSelectedProjectId(id);
    setView('detail');
  };

  const handleCreateProject = () => {
    setFormData({
      name: '',
      description: '',
      color: TAG_COLORS[0],
      startDate: getTodayStr(),
      endDate: '',
      schedule: { type: 'daily', days: [] }
    });
    setView('create');
  };

  const handleEditProject = (p: Project) => {
    setFormData({ ...p });
    setView('edit');
  };

  const handleSubmit = () => {
    if (view === 'create') {
      onAddProject(formData as any);
      setView('list');
    } else {
      onUpdateProject((formData as any).id, formData);
      setView('detail');
    }
  };

  const projectTasks = useMemo(() => selectedProjectId ? tasks.filter(tk => tk.projectId === selectedProjectId) : [], [tasks, selectedProjectId]);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleExportProject = (project: Project) => {
    const pTasks = tasks.filter(t => t.projectId === project.id);
    const exportData = { project, tasks: pTasks, exportedAt: new Date().toISOString() };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `${project.name.replace(/\s+/g, '_')}_export.json`);
    dl.click();
  };

  const getTagColor = (tagName: string) => {
    const cat = categories.find(c => c.name === tagName);
    return cat ? cat.color : 'slate';
  };

  // Re-define TaskCard to use the correct `tasks` scope for lock checking
  const TaskCard: React.FC<{ task: Task; isFirst: boolean; isLast: boolean; projectColor: string }> = ({ task, isFirst, isLast, projectColor }) => {
    const isLocked = task.parentTaskIds?.some(pid => tasks.find(pt => pt.id === pid)?.status !== TaskStatus.COMPLETED);
    const isCompleted = task.status === TaskStatus.COMPLETED;
    const isRunning = task.status === TaskStatus.RUNNING;

    return (
      <div className="flex items-center shrink-0">
        <div className={`
          w-[300px] min-h-[220px] p-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 transition-all relative flex flex-col group/card
          ${isCompleted 
            ? 'border-emerald-500/30 bg-emerald-50/[0.02]' 
            : isLocked 
              ? 'opacity-60 grayscale border-slate-100 dark:border-slate-800' 
              : `border-slate-100 dark:border-slate-800 hover:border-${projectColor}-400 hover:ring-8 hover:ring-${projectColor}-500/5 hover:-translate-y-1.5 shadow-sm hover:shadow-xl`
          }
        `}>
          <div className="flex items-center justify-between mb-5">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'bg-emerald-50 text-emerald-600' : `bg-${projectColor}-50 text-${projectColor}-600`}`}>
              <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-500' : isRunning ? `bg-${projectColor}-500 animate-pulse` : `bg-${projectColor}-500`}`} />
              {isCompleted ? 'DONE' : isLocked ? 'LOCKED' : isRunning ? 'RUNNING' : 'READY'}
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
              <button onClick={() => setEditingTask(task)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Pencil className="w-4.5 h-4.5" /></button>
              <button onClick={() => onDeleteTask(task.id)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-4.5 h-4.5" /></button>
            </div>
          </div>
          
          <h5 className="text-base md:text-lg font-black text-slate-800 dark:text-white mb-2 leading-tight truncate">{task.title}</h5>
          <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">{task.description}</p>
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {task.tags.map(tag => (
                <Badge key={tag} color={getTagColor(tag)} className="text-[10px] px-2.5 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
             <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl"><Flag className="w-3.5 h-3.5 text-indigo-400" /><span>{task.milestones?.length || 0}</span></div>
             <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl"><Clock className="w-3.5 h-3.5" /><span>{Math.floor(task.totalTime / 60000)}m</span></div>
          </div>
        </div>
        {!isLast ? (
          <div className="flex items-center justify-center px-2 shrink-0">
             <div className="relative flex items-center">
                <div className={`w-8 h-1.5 bg-gradient-to-r from-${projectColor}-500/20 to-${projectColor}-500/80 rounded-full`} />
                <div className={`relative z-10 w-8 h-8 rounded-[1rem] bg-${projectColor}-600 flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 mx-[-16px]`}>
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
                <div className={`w-8 h-1.5 bg-gradient-to-l from-${projectColor}-500/20 to-${projectColor}-500/80 rounded-full`} />
             </div>
          </div>
        ) : (
          <div className="flex items-center justify-center px-2 shrink-0">
            <button 
              onClick={() => { setNewTask({ title: '', description: '', parentTaskIds: [task.id] }); setIsAddingTaskToProject(task.id); }} 
              className={`w-8 h-8 rounded-[1rem] bg-white dark:bg-slate-900 border-2 border-dashed border-${projectColor}-300 hover:border-${projectColor}-500 flex items-center justify-center shadow-sm hover:scale-110 transition-all group/add-btn`}
            >
              <Plus className={`w-5 h-5 text-${projectColor}-400 group-hover/add-btn:text-${projectColor}-600`} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const projectTracks = useMemo(() => {
    if (!selectedProjectId) return [];
    // Only tasks for this project
    const pTasks = tasks.filter(t => t.projectId === selectedProjectId);
    
    // Find roots (tasks with no parents OR parents that are not in this project, though strictly they should be in project)
    // We assume strict projectId containment.
    const roots = pTasks.filter(t => !t.parentTaskIds || t.parentTaskIds.length === 0 || !pTasks.some(pt => t.parentTaskIds.includes(pt.id)));
    
    const tracks: Task[][] = [];
    
    const buildChain = (current: Task, chain: Task[]) => {
      chain.push(current);
      // Find children: tasks in this project that have current.id as parent
      const child = pTasks.find(t => t.parentTaskIds?.includes(current.id));
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
  }, [tasks, selectedProjectId]);

  if (view === 'create' || view === 'edit') {
    return (
      <ProjectForm 
        mode={view} 
        title={view === 'create' ? t.createProject : 'Edit Project'} 
        data={formData} 
        onChange={(f: any, v: any) => setFormData(prev => f === 'toggleDay' ? { ...prev, schedule: { ...prev.schedule, days: (prev.schedule?.days || []).includes(v) ? prev.schedule.days.filter((d:any) => d !== v) : [...(prev.schedule?.days || []), v], type: 'weekly' } } : f === 'scheduleType' ? { ...prev, schedule: { ...prev.schedule, type: v } } : { ...prev, [f]: v })}
        onSubmit={handleSubmit} 
        onCancel={() => view === 'create' ? setView('list') : setView('detail')} 
        t={t} 
        DAYS_OF_WEEK={DAYS_OF_WEEK} 
        TAG_COLORS={TAG_COLORS} 
      />
    );
  }

  if (view === 'detail' && selectedProject) {
    const pColor = selectedProject.color || 'indigo';
    
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in bg-white dark:bg-slate-900 rounded-[2.5rem]">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('list')} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-all"><ArrowLeft /></button>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{selectedProject.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                 <Badge color={pColor} className="text-[10px] uppercase tracking-widest">{pColor}</Badge>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{t.projectPlanner}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setIsGraphView(!isGraphView)} className="rounded-2xl">
              {isGraphView ? t.listView : t.graphView}
            </Button>
            <Button onClick={() => handleExportProject(selectedProject)} className="rounded-2xl"><Download className="w-4 h-4 mr-2" />{t.exportProject}</Button>
            <Button onClick={() => handleEditProject(selectedProject)} className="rounded-2xl"><Pencil className="w-4 h-4 mr-2" />{t.projectName}</Button>
            <Button 
                variant="danger" 
                onClick={() => {
                  if (window.confirm(t.deleteProjectWarning)) {
                    onDeleteProject(selectedProject.id);
                    setView('list');
                  }
                }} 
                className="rounded-2xl"
            >
                <Trash2 className="w-4 h-4 mr-2" />
                {t.deleteProject}
            </Button>
          </div>
        </div>

        {/* Content Area - Fixed overflow issue here */}
        <div className="flex-1 relative overflow-hidden bg-slate-50/20 dark:bg-slate-900/10">
           {isGraphView ? (
             <div className="absolute inset-0 overflow-auto p-8 custom-scrollbar">
               <div className="h-[600px] w-full bg-slate-50/30 dark:bg-slate-800/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                  <div className="absolute inset-0 overflow-auto force-scrollbar">
                    <div className="min-w-max min-h-max p-8">
                       <ProjectGraph tasks={projectTasks} color={pColor} />
                    </div>
                  </div>
               </div>
             </div>
           ) : (
             <div className="absolute inset-0 overflow-auto custom-scrollbar force-scrollbar p-8 md:p-12">
                <div className="space-y-16 pb-24 min-w-max">
                   {projectTracks.length === 0 ? (
                     <div className="w-[360px] h-[240px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center gap-6 text-slate-300">
                        <GitBranchPlus className="w-14 h-14 opacity-20" />
                        <span className="text-xs font-black uppercase tracking-widest">{language === 'zh' ? '暂无支线' : 'No Streams'}</span>
                     </div>
                   ) : (
                     projectTracks.map((track, trackIdx) => (
                       <div key={trackIdx} className="flex flex-col gap-6">
                          <div className="flex items-center gap-4 px-6">
                             <div className={`w-2 h-6 rounded-full bg-${pColor}-500 opacity-60 shadow-[0_0_10px_rgba(var(--tw-shadow-color),0.3)]`} />
                             <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{language === 'zh' ? `工作流支线 ${trackIdx + 1}` : `Stream ${trackIdx + 1}`}</h4>
                          </div>
                          <div className="flex items-center px-6">
                            {track.map((task, stepIdx) => (
                              <TaskCard 
                                key={task.id} 
                                task={task} 
                                isFirst={stepIdx === 0} 
                                isLast={stepIdx === track.length - 1} 
                                projectColor={pColor}
                              />
                            ))}
                          </div>
                       </div>
                     ))
                   )}
                   {projectTracks.length < 5 && (
                     <div className="px-6 mt-10">
                        <button onClick={() => { setNewTask({ title: '', description: '', parentTaskIds: [] }); setIsAddingRoot(true); }} className="w-[300px] min-h-[220px] rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 flex flex-col items-center justify-center gap-6 transition-all group bg-white/50 dark:bg-slate-900/50">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 group-hover:scale-110 flex items-center justify-center transition-all shadow-sm">
                            <Plus className="w-8 h-8 text-slate-300 group-hover:text-indigo-500" />
                          </div>
                          <span className="text-sm font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-500 transition-all">{language === 'zh' ? '添加新工作流' : 'New Stream'}</span>
                        </button>
                     </div>
                   )}
                </div>
             </div>
           )}
        </div>
        
        {/* Detail View Modals */}
        {(isAddingTaskToProject || isAddingRoot) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in">
              <form onSubmit={(e) => { e.preventDefault(); if (newTask.title.trim() && selectedProjectId) { onAddTask(newTask.title.trim(), newTask.description, [], selectedProjectId, newTask.parentTaskIds); setIsAddingTaskToProject(null); setIsAddingRoot(false); setNewTask({title:'', description:'', parentTaskIds:[]}); } }} className="bg-white dark:bg-slate-900 w-full max-w-xl p-10 rounded-[3rem] shadow-2xl border-2 border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-10"><h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{isAddingRoot ? (language === 'zh' ? '添加起始节点' : 'New Start Node') : t.addStep}</h3><button type="button" onClick={() => { setIsAddingTaskToProject(null); setIsAddingRoot(false); }} className="p-4 rounded-2xl hover:bg-slate-50 text-slate-400 transition-all"><X className="w-7 h-7" /></button></div>
                  <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 outline-none focus:ring-8 focus:ring-indigo-500/5 font-black text-lg" placeholder={t.stepName} value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                  <div className="flex justify-end gap-5 mt-12"><Button type="button" variant="ghost" className="rounded-2xl px-10 text-base" onClick={() => { setIsAddingTaskToProject(null); setIsAddingRoot(false); }}>{t.cancel}</Button><Button type="submit" className="rounded-2xl px-14 font-black text-lg shadow-xl shadow-indigo-500/10">{t.add}</Button></div>
              </form>
          </div>
        )}

        {editingTask && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in">
              <form onSubmit={(e) => { e.preventDefault(); if (editingTask.title.trim()) { onUpdateTask(editingTask.id, editingTask); setEditingTask(null); } }} className="bg-white dark:bg-slate-900 w-full max-w-2xl p-10 md:p-12 rounded-[3.5rem] shadow-2xl border-2 border-slate-100 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                  <div className="flex items-center justify-between mb-8 shrink-0"><h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight">{language === 'zh' ? '管理任务' : 'Manage Step'}</h3><button type="button" onClick={() => setEditingTask(null)} className="p-4 rounded-2xl hover:bg-slate-50 text-slate-400 transition-all"><X className="w-7 h-7" /></button></div>
                  <div className="space-y-10 overflow-y-auto custom-scrollbar flex-1 pr-4">
                      <div><label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{t.stepName}</label><input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 outline-none focus:ring-8 focus:ring-indigo-500/5 font-black text-lg" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} /></div>
                      <div><label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{t.description}</label><textarea className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 outline-none focus:ring-8 focus:ring-indigo-500/5 font-medium text-base h-32 resize-none shadow-inner leading-relaxed" value={editingTask.description || ''} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} /></div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{language === 'zh' ? '标签分类' : 'Tags'}</label>
                        <div className="flex flex-wrap gap-3 mb-6 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800">
                          {(editingTask.tags || []).length > 0 ? (editingTask.tags || []).map(tag => (
                            <Badge key={tag} color={categories.find(c => c.name === tag)?.color || 'slate'} onClick={() => setEditingTask({ ...editingTask, tags: editingTask.tags.filter(t => t !== tag) })} className="cursor-pointer hover:bg-red-500 hover:text-white transition-all py-2 px-5 rounded-2xl text-[11px]">{tag} <X className="w-4 h-4 ml-2" /></Badge>
                          )) : <span className="text-xs text-slate-300 font-bold uppercase tracking-widest">No tags</span>}
                        </div>
                        <div className="flex flex-wrap gap-3 px-2">
                          {categories.filter(c => !(editingTask.tags || []).includes(c.name)).map(c => (
                            <button key={c.id} type="button" onClick={() => setEditingTask({ ...editingTask, tags: [...(editingTask.tags || []), c.name] })} className="px-5 py-2.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">{c.name}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{language === 'zh' ? 'WBS 里程碑' : 'Milestones'}</label>
                        <div className="space-y-3 mb-6">
                          {(editingTask.milestones || []).map(m => (
                            <div key={m.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 group/mile">
                              <div className="flex items-center gap-4">
                                <Flag className="w-4.5 h-4.5 text-indigo-400" />
                                <span className="text-base font-bold text-slate-700 dark:text-slate-300">{m.title}</span>
                              </div>
                              <button type="button" onClick={() => setEditingTask({ ...editingTask, milestones: editingTask.milestones.filter(x => x.id !== m.id) })} className="p-2.5 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover/mile:opacity-100"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          ))}
                        </div>
                        <div className="relative">
                          <input className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800/50 rounded-[1.75rem] px-8 py-5 outline-none text-base font-bold focus:border-indigo-500 transition-all shadow-inner" placeholder={language === 'zh' ? '输入关键节点标题并回车...' : 'Type milestone and Enter...'} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (val) { setEditingTask({ ...editingTask, milestones: [...(editingTask.milestones || []), { id: Math.random().toString(36).substr(2, 9), title: val, timestamp: Date.now(), branch: 'main' }] }); (e.target as HTMLInputElement).value = ''; } } }} />
                        </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-5 mt-10 pt-10 border-t-2 border-slate-100 dark:border-slate-800 shrink-0"><Button type="button" variant="ghost" className="rounded-2xl px-10 text-base" onClick={() => setEditingTask(null)}>{t.cancel}</Button><Button type="submit" className="rounded-2xl px-14 md:px-18 font-black text-base md:text-lg shadow-xl shadow-indigo-500/10">{language === 'zh' ? '保存更新' : 'Save Changes'}</Button></div>
              </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in">
      <div className="flex items-center justify-between mb-12 shrink-0 px-2">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{t.projectPlanner}</h2>
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mt-3">{t.projectPlannerDesc}</p>
        </div>
        <Button onClick={handleCreateProject} className="rounded-2xl px-10 py-5 text-sm font-black shadow-2xl shadow-indigo-500/20 hover:-translate-y-1 transition-all">
          <GitBranchPlus className="w-5 h-5 mr-3" />
          {t.newProject}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 no-scrollbar">
        {projects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-1000">
            <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner">
              <GitBranchPlus className="w-12 h-12 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-2xl max-w-sm mx-auto leading-relaxed">{t.createTaskHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 pb-16 px-1">
            {displayedProjects.map(project => {
              const pTasks = tasks.filter(tk => tk.projectId === project.id);
              const completed = pTasks.filter(tk => tk.status === TaskStatus.COMPLETED).length;
              const progress = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
              
              // Circle progress config
              const radius = 42; 
              const circumference = 2 * Math.PI * radius; 
              const strokeDashoffset = circumference - (progress / 100) * circumference;

              // Aggregate all unique tags from tasks in this project
              const projectTags: string[] = Array.from(new Set(pTasks.flatMap(t => t.tags || [])));

              return (
                <div 
                  key={project.id}
                  onClick={() => handleOpenDetail(project.id)}
                  className="group flex flex-col md:flex-row items-stretch gap-8 p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800/50 hover:border-indigo-500/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 mx-auto md:mx-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r={radius} className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r={radius} 
                        className={`stroke-${project.color}-500 fill-none transition-all duration-1000`} 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        style={{ strokeDasharray: circumference, strokeDashoffset }} 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-2xl md:text-3xl tabular-nums">
                      {progress}%
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-w-0 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-3">
                      <h3 className="text-2xl md:text-3xl font-black group-hover:text-indigo-600 truncate transition-colors leading-tight">{project.name}</h3>
                      <Badge color={project.color} className="uppercase px-3 py-1 rounded-xl text-[10px] tracking-widest">TRACK ACTIVE</Badge>
                    </div>

                    {projectTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                        {projectTags.map(tag => (
                          <Badge key={tag} color={getTagColor(tag)} className="px-2.5 py-1 text-[10px] uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-slate-500 dark:text-slate-400 text-base line-clamp-2 opacity-80 leading-relaxed mb-4">{project.description}</p>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-auto">{completed} / {pTasks.length} {t.stepsCompleted}</p>
                  </div>

                  <div className="shrink-0 flex items-center justify-center border-t md:border-t-0 md:border-l-2 border-slate-100 dark:border-slate-800 pt-8 md:pt-0 md:pl-10">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-[1.75rem] transition-all group-hover:scale-110 shadow-sm">
                      <ChevronRight className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};