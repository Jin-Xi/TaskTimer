
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft, Pencil, X, ArrowLeft, Flag, Clock, Target, GitBranchPlus, Download, Calendar as CalendarIcon } from 'lucide-react';
import { Project, Task, TaskStatus, Category, DayOfWeek, Language } from '../types';
import { TAG_COLORS, TRANSLATIONS, DEFAULT_CATEGORIES, COLOR_HEX_MAP } from '../constants';
import { Button } from './Button';
import { Badge } from './Badge';

interface ProjectManagerProps {
  language: Language;
  projects: Project[];
  tasks: Task[];
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onAddTask: (title: string, description: string, tags: string[], projectId?: string, parentTaskIds?: string[]) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  categories?: Category[]; 
  onAddCategory: (name: string, color: string) => void;
}

const getTodayStr = () => new Date().toISOString().split('T')[0];

const DatePicker = ({ label, value, onChange, minDate, language }: { label: string, value: string, onChange: (date: string) => void, minDate?: string, language: Language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            setViewDate(date);
        }
    }
  }, [value, isOpen]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const d = String(newDate.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${d}`;
    onChange(isoDate);
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const days = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const dayElements = [];
    
    for (let i = 0; i < startDay; i++) {
      dayElements.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    let selectedYear = -1, selectedMonth = -1, selectedDay = -1;
    if (value) {
        const parts = value.split('-').map(Number);
        if (parts.length === 3) {
            selectedYear = parts[0];
            selectedMonth = parts[1] - 1;
            selectedDay = parts[2];
        }
    }

    for (let d = 1; d <= days; d++) {
      const isSelected = selectedDay === d && selectedMonth === month && selectedYear === year;
      const isToday = isCurrentMonth && today.getDate() === d;
      
      const currentIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isDisabled = minDate ? currentIso < minDate : false;

      dayElements.push(
        <button
          key={d}
          type="button"
          disabled={isDisabled}
          onClick={(e) => { e.stopPropagation(); handleDateSelect(d); }}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${isSelected 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
              : isToday 
                ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' 
                : isDisabled 
                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }
          `}
        >
          {d}
        </button>
      );
    }

    return dayElements;
  };

  const dayHeaders = [t.days.Sun, t.days.Mon, t.days.Tue, t.days.Wed, t.days.Thu, t.days.Fri, t.days.Sat];

  return (
    <div className="relative w-full" ref={containerRef}>
        <label className="flex items-center gap-3 text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-4 ml-1">
            <CalendarIcon className="w-4.5 h-4.5" />
            {label}
        </label>
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`
                w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 
                rounded-[2rem] p-5 outline-none font-black text-base transition-all text-left flex items-center justify-between
                ${isOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'hover:border-indigo-300 dark:hover:border-slate-600'}
            `}
        >
            <span className={value ? 'text-slate-800 dark:text-white' : 'text-slate-400'}>
                {value || (language === 'zh-TW' ? '選擇日期' : '选择日期')}
            </span>
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
        </button>

        {isOpen && (
            <div className="absolute top-full left-0 mt-4 z-50 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-slate-800 w-[340px] animate-in fade-in zoom-in-95 slide-in-from-top-2">
                <div className="flex items-center justify-between mb-6">
                    <button type="button" onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }} className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all active:scale-95">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
                        {t.months ? t.months[viewDate.getMonth()] : viewDate.getMonth() + 1} {viewDate.getFullYear()}
                    </span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleNextMonth(); }} className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all active:scale-95">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-y-3 justify-items-center mb-2">
                    {dayHeaders.map((day, i) => (
                        <div key={i} className="text-center text-[10px] font-black text-slate-300 uppercase mb-2">
                            {day}
                        </div>
                    ))}
                    {renderCalendar()}
                </div>
            </div>
        )}
    </div>
  );
};

const ProjectForm = ({ 
  mode, 
  title, 
  data, 
  onChange, 
  onSubmit, 
  onCancel, 
  t, 
  DAYS_OF_WEEK, 
  TAG_COLORS,
  language
}: any) => {
  const scheduleType = data?.schedule?.type || data?.scheduleType || 'daily';
  const selectedDays = data?.schedule?.days || data?.selectedDays || [];

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
      <div className="flex items-center justify-between px-8 md:px-12 py-8 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-10 sticky top-0">
         <div className="flex items-center gap-8">
            <button type="button" onClick={onCancel} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-all active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">{title}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{mode === 'create' ? t.projectPlanner : (data?.name || 'Project Detail')}</p>
            </div>
         </div>
         <Button onClick={onSubmit} className="rounded-2xl px-8 md:px-10 py-4 shadow-xl shadow-indigo-500/20 font-black text-sm md:text-base uppercase tracking-wider shrink-0 hover:shadow-indigo-500/30 transition-shadow">
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
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 font-black text-2xl shadow-inner transition-all duration-300" 
                    value={data?.name || ''} 
                    onChange={(e) => onChange('name', e.target.value)} 
                    placeholder="e.g. Q4 Marketing Campaign"
                  />
               </div>
               <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{t.description}</label>
                  <textarea 
                    className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 font-medium text-lg h-48 resize-none shadow-inner leading-relaxed transition-all duration-300" 
                    value={data?.description || ''} 
                    onChange={(e) => onChange('description', e.target.value)} 
                    placeholder="Describe the main goals and deliverables..."
                  />
               </div>
            </div>

            <div>
               <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">Timeline</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-10 bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] border border-slate-200/50 dark:border-slate-800/50">
                  <div>
                      <DatePicker 
                        label={t.startDate}
                        value={data?.startDate || ''}
                        onChange={(date) => onChange('startDate', date)}
                        language={language}
                      />
                  </div>
                  <div>
                      <DatePicker 
                        label={t.endDate}
                        value={data?.endDate || ''}
                        onChange={(date) => onChange('endDate', date)}
                        minDate={data?.startDate}
                        language={language}
                      />
                  </div>
               </div>
            </div>

            <div>
               <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{t.schedule}</label>
               <div className="bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex gap-3">
                   {['daily', 'weekly'].map(type => (
                       <button
                         key={type}
                         type="button"
                         onClick={() => onChange('scheduleType', type)}
                         className={`flex-1 py-6 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all duration-300 ${scheduleType === type ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
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
  language, projects, tasks, onAddProject, onUpdateProject, onDeleteProject, onAddTask, onDeleteTask, onUpdateTask, categories = DEFAULT_CATEGORIES, onAddCategory
}) => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [isAddingTaskToProject, setIsAddingTaskToProject] = useState<string | null>(null);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', parentTaskIds: [] as string[] });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  // Theme color state - persists in localStorage
  const [themeColor, setThemeColor] = useState(() => {
    const saved = localStorage.getItem('chrono_theme_color');
    return saved || 'indigo';
  });

  const handleThemeColorChange = (color: string) => {
    setThemeColor(color);
    localStorage.setItem('chrono_theme_color', color);
  };

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

  const TaskCard: React.FC<{ task: Task; isFirst: boolean; isLast: boolean; projectColor: string }> = ({ task, isFirst, isLast, projectColor }) => {
    const isLocked = task.parentTaskIds?.some(pid => tasks.find(pt => pt.id === pid)?.status !== TaskStatus.COMPLETED);
    const isCompleted = task.status === TaskStatus.COMPLETED;
    const isRunning = task.status === TaskStatus.RUNNING;

    // Use theme color for styling
    const colors = COLOR_HEX_MAP[themeColor] || COLOR_HEX_MAP.indigo;

    return (
      <div className="flex items-center shrink-0">
        <div className={`
          w-[280px] sm:w-[300px] h-[260px] p-4 sm:p-5 rounded-[2rem] bg-white dark:bg-slate-900 border transition-all duration-300 relative flex flex-col group/card
          ${isCompleted
            ? 'border-emerald-200/50 bg-emerald-50/[0.1] dark:border-emerald-900/30'
            : isLocked
              ? 'opacity-60 grayscale border-slate-200/50 dark:border-slate-800'
              : 'border-slate-200/60 dark:border-slate-800 hover:shadow-2xl hover:-translate-y-1.5 shadow-md shadow-slate-200/50 dark:shadow-black/20'
          }
          `}
          style={isCompleted || isLocked ? undefined : {
            borderColor: `${colors.light}40`,
            '--hover-shadow': `${colors.main}1a`
          } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider"
                 style={isCompleted ? { backgroundColor: '#d1fae5', color: '#059669' } : { backgroundColor: colors.bg, color: colors.dark }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isCompleted ? '#10b981' : colors.main }} />
              {isCompleted ? 'DONE' : isLocked ? 'LOCKED' : isRunning ? 'RUNNING' : 'READY'}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
              <button onClick={() => setEditingTask(task)} className="p-1 sm:p-1.5 text-slate-400 hover:text-indigo-600 transition-all"><Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
              <button onClick={() => onDeleteTask(task.id)} className="p-1 sm:p-1.5 text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
            </div>
          </div>

          <h5 className="text-xs sm:text-sm md:text-base font-black text-slate-800 dark:text-white mb-1.5 sm:mb-2 leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.25rem]">{task.title}</h5>
          <p className="text-slate-400 text-[11px] sm:text-xs leading-snug line-clamp-3 sm:line-clamp-4 flex-1 overflow-hidden">{task.description || ''}</p>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
              {task.tags.map(tag => (
                <Badge key={tag} color={getTagColor(tag)} className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-wider mt-auto pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-slate-800/50 overflow-hidden">
             <div className="flex items-center gap-1 min-w-0"><Flag className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" style={{ color: colors.main }} /><span className="truncate">{task.milestones?.length || 0}</span></div>
             <div className="flex items-center gap-1 min-w-0"><Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /><span className="truncate">{Math.floor(task.totalTime / 60000)}m</span></div>
          </div>
        </div>
        {!isLast ? (
          <div className="flex items-center justify-center px-1 shrink-0 relative">
             {/* Arrow line */}
             <div className="flex items-center">
               <div className="w-12 h-1.5 rounded-full" style={{ background: `linear-gradient(to right, ${colors.lighter}80, ${colors.main}99)` }} />
               {/* Arrow head */}
               <div className="w-0 h-0 ml-[-2px]" style={{
                 borderLeft: `10px solid ${colors.main}`,
                 borderTop: '6px solid transparent',
                 borderBottom: '6px solid transparent'
               }} />
             </div>
          </div>
        ) : (
          <div className="flex items-center justify-center px-1 shrink-0">
            <button
              onClick={() => { setNewTask({ title: '', description: '', parentTaskIds: [task.id] }); setIsAddingTaskToProject(task.id); }}
              className="flex items-center group/add-btn"
            >
              {/* Arrow line */}
              <div className="w-8 h-1.5 rounded-full transition-all group-hover/add-btn:w-10" style={{
                background: `linear-gradient(to right, ${colors.lighter}60, ${colors.light}80)`,
              }} />
              {/* Plus button */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm hover:scale-110 hover:shadow-md transition-all ml-1"
                   style={{
                     backgroundColor: colors.bg,
                     border: `2px solid ${colors.light}`,
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.main}
                   onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.light}>
                <Plus className="w-4 h-4 transition-all" style={{ color: colors.main }} />
              </div>
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

  const handleFormChange = (f: string, v: any) => {
    setFormData(prev => {
        if (f === 'toggleDay') {
            const currentSchedule = prev.schedule || { type: 'weekly', days: [] };
            const currentDays = currentSchedule.days || [];
            const newDays = currentDays.includes(v)
                ? currentDays.filter((d: any) => d !== v)
                : [...currentDays, v];
            
            return {
                ...prev,
                schedule: {
                    ...currentSchedule,
                    type: 'weekly',
                    days: newDays
                }
            };
        }
        
        if (f === 'scheduleType') {
            const currentSchedule = prev.schedule || { type: 'daily', days: [] };
            return {
                ...prev,
                schedule: {
                    ...currentSchedule,
                    type: v
                }
            };
        }
        
        return { ...prev, [f]: v };
    });
  };

  if (view === 'create' || view === 'edit') {
    return (
      <ProjectForm 
        mode={view} 
        title={view === 'create' ? t.createProject : 'Edit Project'} 
        data={formData} 
        onChange={handleFormChange}
        onSubmit={handleSubmit} 
        onCancel={() => view === 'create' ? setView('list') : setView('detail')} 
        t={t} 
        DAYS_OF_WEEK={DAYS_OF_WEEK} 
        TAG_COLORS={TAG_COLORS}
        language={language} 
      />
    );
  }

  if (view === 'detail' && selectedProject) {
    const pColor = selectedProject.color || 'indigo';
    const colors = COLOR_HEX_MAP[themeColor] || COLOR_HEX_MAP.indigo;
    const themeColors = colors; // Alias for backward compatibility

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-black/40 border border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <button onClick={() => setView('list')} className="p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-all shrink-0"><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white truncate">{selectedProject.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <Badge color={pColor} className="text-[8px] sm:text-[10px] uppercase tracking-wider shrink-0">{pColor}</Badge>
                 <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{t.projectPlanner}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto">
            {/* Theme Color Picker */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 shrink-0">
              <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">{language === 'zh-TW' ? '主題' : '主题'}</span>
              <div className="flex gap-1 sm:gap-1.5">
                {TAG_COLORS.slice(0, 5).map(color => (
                  <button
                    key={color}
                    onClick={() => handleThemeColorChange(color)}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg transition-all ${themeColor === color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-slate-400 scale-110' : 'opacity-50 hover:opacity-100 hover:scale-105'}`}
                    style={{ backgroundColor: COLOR_HEX_MAP[color]?.main || '#6366f1' }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button onClick={() => handleExportProject(selectedProject)} className="rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs shrink-0"><Download className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline ml-1">{t.exportProject}</span></Button>
              <Button onClick={() => handleEditProject(selectedProject)} className="rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs shrink-0"><Pencil className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline ml-1">{t.projectName}</span></Button>
              <Button
                  variant="danger"
                  onClick={() => {
                    if (window.confirm(t.deleteProjectWarning)) {
                      onDeleteProject(selectedProject.id);
                      setView('list');
                    }
                  }}
                  className="rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs shrink-0"
              >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline ml-1">{t.deleteProject}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden bg-slate-50/20 dark:bg-slate-900/10">
           <div className="absolute inset-0 overflow-auto custom-scrollbar force-scrollbar p-8 md:p-12">
                <div className="space-y-16 pb-24 min-w-max">
                   {projectTracks.length === 0 ? (
                     <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center text-center opacity-70">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                           <GitBranchPlus className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{t.noProjectTasks}</h3>
                        <p className="text-slate-500 font-bold mb-8">{t.addProjectTaskHint}</p>
                        <button
                          onClick={() => { setNewTask({ title: '', description: '', parentTaskIds: [] }); setIsAddingRoot(true); }}
                          className="px-8 py-4 rounded-2xl text-white font-black shadow-xl transition-all flex items-center gap-3 hover:shadow-2xl hover:-translate-y-0.5"
                          style={{ backgroundColor: colors.main }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.dark}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.main}
                        >
                           <Plus className="w-5 h-5" />
                           {language === 'zh-TW' ? '新增工作流' : '添加新工作流'}
                        </button>
                     </div>
                   ) : (
                     projectTracks.map((track, trackIdx) => (
                       <div key={trackIdx} className={trackIdx > 0 ? "pt-16 border-t-2 border-slate-100/80 dark:border-slate-800/80" : ""}>
                         <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4 px-6">
                               <div className="w-2 h-6 rounded-full opacity-70" style={{
                                 backgroundColor: themeColors.main,
                                 boxShadow: `0 0 10px ${themeColors.main}4d`
                               }} />
                               <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{language === 'zh-TW' ? `工作流支線 ${trackIdx + 1}` : `工作流支线 ${trackIdx + 1}`}</h4>
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
                       </div>
                     ))
                   )}
                   {projectTracks.length > 0 && projectTracks.length < 5 && (
                     <div className="px-6 mt-10 pt-16 border-t-2 border-slate-100/80 dark:border-slate-800/80">
                        <button
                          onClick={() => { setNewTask({ title: '', description: '', parentTaskIds: [] }); setIsAddingRoot(true); }}
                          className="w-[300px] h-[260px] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-6 transition-all group bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900/80"
                          style={{ borderColor: `${colors.light}60` }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.main}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = `${colors.light}60`}
                        >
                          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 group-hover:scale-110 flex items-center justify-center transition-all shadow-sm">
                            <Plus className="w-8 h-8 text-slate-300 group-hover:text-indigo-500" style={{ transition: 'color 0.2s' }} />
                          </div>
                          <span className="text-sm font-black uppercase tracking-widest text-slate-300 transition-all">{language === 'zh-TW' ? '新增工作流' : '添加新工作流'}</span>
                        </button>
                     </div>
                   )}
                </div>
             </div>
        </div>
        
        {/* Detail View Modals */}
        {(isAddingTaskToProject || isAddingRoot) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in">
              <form onSubmit={(e) => { e.preventDefault(); if (newTask.title.trim() && selectedProjectId) { onAddTask(newTask.title.trim(), newTask.description, [], selectedProjectId, newTask.parentTaskIds); setIsAddingTaskToProject(null); setIsAddingRoot(false); setNewTask({title:'', description:'', parentTaskIds:[]}); } }} className="bg-white dark:bg-slate-900 w-full max-w-xl p-10 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-10"><h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{isAddingRoot ? (language === 'zh-TW' ? '新增起始節點' : '添加起始节点') : t.addStep}</h3><button type="button" onClick={() => { setIsAddingTaskToProject(null); setIsAddingRoot(false); }} className="p-4 rounded-2xl hover:bg-slate-50 text-slate-400 transition-all"><X className="w-7 h-7" /></button></div>
                  <input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 outline-none focus:ring-8 focus:ring-indigo-500/5 font-black text-lg" placeholder={t.stepName} value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                  <div className="flex justify-end gap-5 mt-12"><Button type="button" variant="ghost" className="rounded-2xl px-10 text-base" onClick={() => { setIsAddingTaskToProject(null); setIsAddingRoot(false); }}>{t.cancel}</Button><Button type="submit" className="rounded-2xl px-14 font-black text-lg shadow-xl shadow-indigo-500/10">{t.add}</Button></div>
              </form>
          </div>
        )}

        {editingTask && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in">
              <form onSubmit={(e) => { e.preventDefault(); if (editingTask.title.trim()) { onUpdateTask(editingTask.id, editingTask); setEditingTask(null); } }} className="bg-white dark:bg-slate-900 w-full max-w-2xl p-10 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                  <div className="flex items-center justify-between mb-8 shrink-0"><h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight">{language === 'zh-TW' ? '管理任務' : '管理任务'}</h3><button type="button" onClick={() => setEditingTask(null)} className="p-4 rounded-2xl hover:bg-slate-50 text-slate-400 transition-all"><X className="w-7 h-7" /></button></div>
                  <div className="space-y-10 overflow-y-auto custom-scrollbar flex-1 pr-4">
                      <div><label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{t.stepName}</label><input autoFocus required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 outline-none focus:ring-8 focus:ring-indigo-500/5 font-black text-lg" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} /></div>
                      <div><label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{t.description}</label><textarea className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 outline-none focus:ring-8 focus:ring-indigo-500/5 font-medium text-base h-32 resize-none shadow-inner leading-relaxed" value={editingTask.description || ''} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} /></div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{language === 'zh-TW' ? '標籤分類' : '标签分类'}</label>
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
                        
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                            <label className="block text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 ml-2">{language === 'zh-TW' ? '新建標籤' : '新建标签'}</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1.5 pl-4 flex items-center gap-3 focus-within:border-indigo-500/50 transition-colors">
                                    <div className={`w-3 h-3 rounded-full bg-${newTagColor}-500 shadow-sm shrink-0`} />
                                    <input 
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        placeholder={language === 'zh-TW' ? '標籤名稱...' : '标签名称...'}
                                        className="bg-transparent border-none outline-none text-sm font-bold w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-300"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (newTagName.trim()) {
                                                    onAddCategory(newTagName.trim(), newTagColor);
                                                    setNewTagName('');
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <Button 
                                    type="button" 
                                    disabled={!newTagName.trim()}
                                    onClick={() => {
                                        if (newTagName.trim()) {
                                            onAddCategory(newTagName.trim(), newTagColor);
                                            setNewTagName('');
                                        }
                                    }}
                                    className="rounded-2xl w-12 h-12 flex items-center justify-center p-0 shrink-0"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-4 px-1">
                                {TAG_COLORS.map(c => (
                                    <button 
                                    key={c}
                                    type="button"
                                    onClick={() => setNewTagColor(c)}
                                    className={`w-8 h-8 rounded-xl bg-${c}-500 transition-all duration-300 ${newTagColor === c ? 'ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-slate-200 dark:ring-slate-700 scale-110 shadow-lg' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                                    />
                                ))}
                            </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">{language === 'zh-TW' ? 'WBS 里程碑' : 'WBS 里程碑'}</label>
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
                          <input className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800/50 rounded-[1.75rem] px-8 py-5 outline-none text-base font-bold focus:border-indigo-500 transition-all shadow-inner" placeholder={language === 'zh-TW' ? '輸入關鍵節點標題並回車...' : '输入关键节点标题并回车...'} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (val) { setEditingTask({ ...editingTask, milestones: [...(editingTask.milestones || []), { id: Math.random().toString(36).substr(2, 9), title: val, timestamp: Date.now(), branch: 'main' }] }); (e.target as HTMLInputElement).value = ''; } } }} />
                        </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-5 mt-10 pt-10 border-t-2 border-slate-100 dark:border-slate-800 shrink-0"><Button type="button" variant="ghost" className="rounded-2xl px-10 text-base" onClick={() => setEditingTask(null)}>{t.cancel}</Button><Button type="submit" className="rounded-2xl px-14 md:px-18 font-black text-base md:text-lg shadow-xl shadow-indigo-500/10">{language === 'zh-TW' ? '保存更新' : '保存更新'}</Button></div>
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
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{t.noProjectsYet}</h3>
            <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed mb-8">{t.createProjectHint}</p>
            <Button onClick={handleCreateProject} size="lg" className="rounded-2xl px-12 py-4 shadow-xl">
               {t.newProject}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 pb-16 px-6 pt-4">
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
                  className="group flex flex-col md:flex-row items-stretch gap-8 p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-500/30 hover:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.5)] transition-all cursor-pointer relative overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-black/20"
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
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-[1.75rem] transition-all group-hover:scale-110 shadow-sm">
                      <ChevronRight className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {projects.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-4 px-6 pb-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:hover:shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.ceil(projects.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(projects.length / ITEMS_PER_PAGE), p + 1))}
                  disabled={currentPage === Math.ceil(projects.length / ITEMS_PER_PAGE)}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:hover:shadow-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
