
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronLeft, Pencil, X, ArrowLeft, Flag, Clock, Target, GitBranchPlus, Download, Calendar as CalendarIcon, Check, Circle } from 'lucide-react';
import { Project, Task, TaskStatus, Category, DayOfWeek, Language } from '../types';
import { TAG_COLORS, TRANSLATIONS, DEFAULT_CATEGORIES, COLOR_HEX_MAP } from '../constants';
import { Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Checkbox, Tooltip, Card } from '@heroui/react';
import { StaggeredList } from '../animations/components/StaggeredList';
import { ProjectZeroState } from './ProjectZeroState';
import { SplitActionButton } from './SplitActionButton';
import { AIPlanningModal } from './AIPlanningModal';
import { motion } from 'framer-motion';
import { listItemVariants } from '../animations/variants';

interface ProjectManagerProps {
  language: Language;
  projects: Project[];
  tasks: Task[];
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onAddTask: (title: string, description: string, tags: string[], projectId?: string, parentTaskIds?: string[], isTerminal?: boolean) => void;
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
              ? 'bg-green-400 text-white shadow-lg shadow-green/30' 
              : isToday 
                ? 'text-green-600 bg-green-50 dark:bg-green-900/30' 
                : isDisabled 
                    ? 'text-neutral-300 dark:text-slate-700 cursor-not-allowed'
                    : 'text-slate-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-slate-800'
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
        <label className="flex items-center gap-3 text-xs font-black text-green-500 uppercase tracking-[0.2em] mb-4 ml-1">
            <CalendarIcon className="w-4.5 h-4.5" />
            {label}
        </label>
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`
                w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 
                rounded-[2rem] p-5 outline-none font-black text-base transition-all text-left flex items-center justify-between
                ${isOpen ? 'border-green-500 ring-4 ring-green-500/10' : 'hover:border-green-300 dark:hover:border-slate-600'}
            `}
        >
            <span className={value ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}>
                {value || (language === 'zh-TW' ? '選擇日期' : '选择日期')}
            </span>
            <ChevronRight className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
        </button>

        {isOpen && (
            <div className="absolute top-full left-0 mt-4 z-50 p-6 bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6)] border border-neutral-100 dark:border-neutral-800 w-[340px] animate-in fade-in zoom-in-95 slide-in-from-top-2">
                <div className="flex items-center justify-between mb-6">
                    <button type="button" onClick={(e) => { e.stopPropagation(); handlePrevMonth(); }} className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-neutral-400 hover:text-slate-600 transition-all active:scale-95">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest">
                        {t.months ? t.months[viewDate.getMonth()] : viewDate.getMonth() + 1} {viewDate.getFullYear()}
                    </span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleNextMonth(); }} className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-neutral-400 hover:text-slate-600 transition-all active:scale-95">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-y-3 justify-items-center mb-2">
                    {dayHeaders.map((day, i) => (
                        <div key={i} className="text-center text-[10px] font-black text-neutral-300 uppercase mb-2">
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
    // 居中容器 - 与 detail 视图保持一致
    <div className="h-full flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden">
      <div className="w-full max-w-6xl max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-4rem)] flex flex-col animate-in fade-in bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl shadow-neutral-200/40 dark:shadow-black/40 border-2 border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {/* Header - 固定在顶部 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 shrink-0 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-3 sm:gap-4">
            <button type="button" onClick={onCancel} className="p-2 sm:p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all border-2 border-neutral-200 dark:border-neutral-700 shrink-0">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white truncate leading-tight">{title}</h2>
            </div>
          </div>
          <Button onClick={onSubmit} className="motion-animate rounded-xl px-6 py-3 shadow-xl font-semibold text-sm border-2 shrink-0 bg-green-500 text-white hover:bg-green-600 transition-colors border-green-600">
            {mode === 'create' ? t.createProject : (language === 'zh-TW' ? '保存變更' : '保存更改')}
          </Button>
        </div>

        {/* Content Canvas - 下半部分画布，支持垂直滚动 */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-gradient-to-b from-neutral-50/50 to-neutral-100/30 dark:from-neutral-800/20 dark:to-neutral-900/30">
          <div className="p-8 md:p-12">
         <div className="w-full max-w-5xl mx-auto space-y-12">
            <div className="space-y-8">
               <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 ml-2">{t.projectName}</label>
                  <input
                    autoFocus
                    required
                    className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4 outline-none focus:border-green-500 dark:focus:border-green-400 font-semibold text-base transition-all"
                    value={data?.name || ''}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder="e.g. Q4 Marketing Campaign"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 ml-2">{t.description}</label>
                  <textarea
                    className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4 outline-none focus:border-green-500 dark:focus:border-green-400 font-medium text-base h-32 resize-none transition-all"
                    value={data?.description || ''}
                    onChange={(e) => onChange('description', e.target.value)}
                    placeholder="Describe the main goals and deliverables..."
                  />
               </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 ml-2">{language === 'zh-TW' ? '時間軸' : '时间轴'}</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white dark:bg-neutral-800 rounded-xl border-2 border-neutral-200 dark:border-neutral-700">
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
               <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 ml-2">{t.schedule}</label>
               <div className="bg-white dark:bg-neutral-800 p-2 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 flex gap-3">
                   {['daily', 'weekly'].map(type => (
                       <button
                         key={type}
                         type="button"
                         onClick={() => onChange('scheduleType', type)}
                         className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${scheduleType === type ? 'bg-green-500 text-white shadow-lg' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
                       >
                         {type === 'daily' ? t.everyDay : t.specificDays}
                       </button>
                   ))}
               </div>
               {scheduleType === 'weekly' && (
                  <div className="flex flex-wrap justify-center gap-2 mt-4 px-2">
                     {DAYS_OF_WEEK.map((day: any) => (
                       <button
                         key={day}
                         type="button"
                         onClick={() => onChange('toggleDay', day)}
                         className={`w-12 h-12 rounded-lg text-xs font-bold transition-all flex items-center justify-center border-2 ${selectedDays.includes(day) ? 'bg-green-500 text-white border-green-600 shadow-md' : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-green-500'}`}
                       >
                         {t.days[day]}
                       </button>
                     ))}
                  </div>
               )}
            </div>

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
  const [showAIPlanning, setShowAIPlanning] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', parentTaskIds: [] as string[], isTerminal: false });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  // Theme color state - persists in localStorage
  const [themeColor, setThemeColor] = useState(() => {
    const saved = localStorage.getItem('chrono_theme_color');
    return saved || 'green';
  });

  const handleThemeColorChange = (color: string) => {
    setThemeColor(color);
    localStorage.setItem('chrono_theme_color', color);
  };

  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    color: 'green',
    startDate: getTodayStr(),
    endDate: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
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

  const getChipColor = (tagName: string): 'success' | 'warning' | 'danger' | 'default' => {
    const color = getTagColor(tagName);
    if (color === 'green') return 'success';
    if (color === 'ochre') return 'warning';
    if (color === 'terracotta') return 'danger';
    return 'default';
  };
  const TaskCard: React.FC<{ task: Task; isFirst: boolean; isLast: boolean; projectColor: string }> = ({ task, isFirst, isLast, projectColor }) => {
    const isLocked = task.parentTaskIds?.some(pid => tasks.find(pt => pt.id === pid)?.status !== TaskStatus.COMPLETED);
    const isCompleted = task.status === TaskStatus.COMPLETED;
    const isRunning = task.status === TaskStatus.RUNNING;
    const isTerminal = task.isTerminal;

    // Use theme color for styling
    const colors = COLOR_HEX_MAP[themeColor] || COLOR_HEX_MAP.green;

    return (
      <div className="flex items-center shrink-0">
        <Card
          isPressable={!isLocked}
          isDisabled={isLocked}
          className={`
            w-[180px] h-auto min-h-[120px] p-2.5 rounded-xl transition-all duration-300 relative flex flex-col group/card shadow-sm
            ${isTerminal && !isCompleted ? 'ring-1.5 ring-terracotta-400 dark:ring-terracotta-500' : ''}
          `}
          classNames={{
            base: `
              ${isCompleted
                ? 'bg-green-50/90 dark:bg-green-900/30 border-green-400/60 dark:border-green-700'
                : isLocked
                  ? 'bg-neutral-100/80 dark:bg-neutral-800/60 border-neutral-300 dark:border-neutral-600 opacity-70'
                  : 'hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-500'
              }
            `,
          }}
          style={isCompleted || isLocked ? undefined : {
            borderColor: isRunning ? `${colors.main}CC` : `${colors.light}CC`,
            borderWidth: '1px'
          } as React.CSSProperties}
        >
          {/* 状态标签 + 操作按钮 */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold"
                 style={isCompleted ? { backgroundColor: '#d1fae5', color: '#059669' } : isTerminal ? { backgroundColor: '#FEE2E2', color: '#DC2626' } : { backgroundColor: colors.bg, color: colors.dark }}>
              {isTerminal ? <Flag className="w-2 h-2" /> : isCompleted ? '✓' : isLocked ? '🔒' : isRunning ? '▶' : '○'}
              <span>{isTerminal ? '终点' : isCompleted ? '完成' : isLocked ? '锁定' : isRunning ? '进行' : '就绪'}</span>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
              <button onClick={() => setEditingTask(task)} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-green-600 transition-all"><Pencil className="w-2.5 h-2.5" /></button>
              <button onClick={() => onDeleteTask(task.id)} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400 hover:text-red-500 transition-all"><Trash2 className="w-2.5 h-2.5" /></button>
            </div>
          </div>

          {/* 标题 */}
          <h5 className="text-[11px] font-bold text-neutral-900 dark:text-white leading-tight line-clamp-2 mb-1">{task.title}</h5>

          {/* 描述 */}
          {task.description && (
            <p className="text-[9px] text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2 mb-1.5">{task.description}</p>
          )}

          {/* 标签 */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mb-1.5">
              {task.tags.map(tag => (
                <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 底部信息栏 */}
          <div className="flex items-center justify-between text-[8px] text-neutral-400 mt-auto pt-1.5 border-t border-neutral-100/80 dark:border-neutral-700/50">
             <div className="flex items-center gap-1">
               <Flag className="w-2.5 h-2.5" style={{ color: colors.main }} />
               <span>{task.milestones?.length || 0}</span>
             </div>
             <div className="flex items-center gap-1 font-mono">
               <Clock className="w-2.5 h-2.5" />
               <span>{Math.floor(task.totalTime / 60000)}分钟</span>
             </div>
          </div>
        </Card>
        {!isLast ? (
          <div className="flex items-center justify-center px-0.5 shrink-0">
             <div className="flex items-center">
               <div className="w-6 h-0.5 rounded-full" style={{ background: `linear-gradient(to right, ${colors.lighter}90, ${colors.main})` }} />
               <div className="w-0 h-0 ml-[-0.5px]" style={{
                 borderLeft: `5px solid ${colors.main}`,
                 borderTop: '3px solid transparent',
                 borderBottom: '3px solid transparent'
               }} />
             </div>
          </div>
        ) : !task.isTerminal ? (
          <div className="flex items-center justify-center px-0.5 shrink-0">
            <button
              onClick={() => { setNewTask({ title: '', description: '', parentTaskIds: [task.id], isTerminal: false }); setIsAddingTaskToProject(task.id); }}
              className="flex items-center group/add-btn"
            >
              <div className="w-4 h-0.5 rounded-full transition-all group-hover/add-btn:w-6" style={{
                background: `linear-gradient(to right, ${colors.lighter}70, ${colors.light}90)`,
              }} />
              <div className="w-5 h-5 rounded-md flex items-center justify-center shadow-sm hover:scale-110 transition-all ml-0.5"
                   style={{
                     backgroundColor: colors.bg,
                     border: `1px solid ${colors.light}`,
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.main}
                   onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.light}>
                <Plus className="w-2.5 h-2.5" style={{ color: colors.main }} />
              </div>
            </button>
          </div>
        ) : null}
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
        title={view === 'create' ? t.createProject : (language === 'zh-TW' ? '編輯項目' : '编辑项目')} 
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
    const pColor = selectedProject.color || 'green';
    const colors = COLOR_HEX_MAP[pColor] || COLOR_HEX_MAP.green;
    const themeColors = colors; // Alias for backward compatibility
    const totalCards = projectTracks.flat().length;
    const enableStagger = totalCards <= 50;

    return (
      // 居中容器 - 像专注卡片一样在画面中央
      <div className="h-full flex items-center justify-center p-4 md:p-6 lg:p-8 overflow-hidden">
        <div className="w-full max-w-6xl max-h-[calc(100vh-2rem)] md:max-h-[calc(100vh-3rem)] lg:max-h-[calc(100vh-4rem)] flex flex-col animate-in fade-in bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl shadow-neutral-200/40 dark:shadow-black/40 border-2 border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {/* Header - 固定在顶部 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 shrink-0 bg-white dark:bg-neutral-900">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button onClick={() => setView('list')} className="p-2 sm:p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all border-2 border-neutral-200 dark:border-neutral-700 shrink-0"><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /></button>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white truncate leading-tight">{selectedProject.name}</h2>
                <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider truncate mt-1">{t.projectPlanner}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  onClick={() => handleExportProject(selectedProject)}
                  variant="bordered"
                  className="motion-animate rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs shrink-0 font-semibold border-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline ml-1">{t.exportProject}</span>
                </Button>
                <Button
                  onClick={() => handleEditProject(selectedProject)}
                  variant="bordered"
                  className="motion-animate rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs shrink-0 font-semibold border-2 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                >
                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline ml-1">{t.projectName}</span>
                </Button>
                <Button
                    color="danger"
                    variant="bordered"
                    onClick={() => {
                      if (window.confirm(t.deleteProjectWarning)) {
                        onDeleteProject(selectedProject.id);
                        setView('list');
                      }
                    }}
                    className="motion-animate rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs shrink-0 font-semibold border-2 bg-neutral-50 dark:bg-neutral-800 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline ml-1">{t.deleteProject}</span>
                </Button>
              </div>
            </div>

          {/* Content Canvas - 下半部分画布，支持垂直滚动查看多条流水线 */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-gradient-to-b from-neutral-50/50 to-neutral-100/30 dark:from-neutral-800/20 dark:to-neutral-900/30">
             <div className="p-4 md:p-6 pb-12">
                  {projectTracks.length === 0 ? (
                    <div className="h-full flex items-center justify-center min-h-[300px]">
                      <ProjectZeroState
                        onManualAdd={() => { setNewTask({ title: '', description: '', parentTaskIds: [], isTerminal: false }); setIsAddingRoot(true); }}
                        onAIGenerate={() => setShowAIPlanning(true)}
                        language={language}
                        projectColor={pColor}
                      />
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {projectTracks.map((track, trackIdx) => {
                        let cardIndex = 0;
                        return (
                        <div key={trackIdx} className={trackIdx > 0 ? "pt-8 border-t border-neutral-200/50 dark:border-neutral-700/50" : ""}>
                          <div className="flex flex-col gap-3">
                             {/* 支线标题 */}
                             <div className="flex items-center gap-2 px-2 sticky left-0 bg-gradient-to-r from-neutral-50/80 to-transparent dark:from-neutral-800/80 dark:to-transparent py-1 z-10">
                                <div className="w-1.5 h-4 rounded-full" style={{
                                  backgroundColor: themeColors.main,
                                  boxShadow: `0 0 8px ${themeColors.main}60`
                                }} />
                                <h4 className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em]">{language === 'zh-TW' ? `支線 ${trackIdx + 1}` : `支线 ${trackIdx + 1}`}</h4>
                             </div>
                             {/* 任务流画布 - 支持水平滚动查看被裁剪的任务卡片 */}
                             <div className="flex items-start gap-2 px-2 overflow-x-auto pb-3 custom-scrollbar-x">
                               {track.map((task, stepIdx) => {
                                 const currentIndex = cardIndex++;
                                 return (
                                 <motion.div
                                   key={task.id}
                                   custom={currentIndex * 0.03}
                                   variants={listItemVariants}
                                   initial="initial"
                                   animate="animate"
                                   exit="exit"
                                   transition={{
                                     delay: enableStagger ? currentIndex * 0.03 : 0,
                                   }}
                                   className="flex-shrink-0"
                                 >
                                   <TaskCard
                                     task={task}
                                     isFirst={stepIdx === 0}
                                     isLast={stepIdx === track.length - 1}
                                     projectColor={pColor}
                                   />
                                 </motion.div>
                               );
                               })}
                             </div>
                          </div>
                        </div>
                      );
                      })}
                      {/* 添加更多任务的按钮 */}
                      {projectTracks.length > 0 && projectTracks.length < 5 && (
                        <div className="px-2 mt-8 pt-8 border-t border-neutral-200/50 dark:border-neutral-700/50">
                           <SplitActionButton
                             onManualAdd={() => { setNewTask({ title: '', description: '', parentTaskIds: [], isTerminal: false }); setIsAddingRoot(true); }}
                             onAIGenerate={() => setShowAIPlanning(true)}
                             language={language}
                             projectColor={pColor}
                           />
                        </div>
                      )}
                    </div>
                  )}
             </div>
          </div>
        
        {/* Detail View Modals */}
        {(isAddingTaskToProject || isAddingRoot) && (
          <Modal
            isOpen={true}
            hideCloseButton
            onClose={() => {
              setIsAddingTaskToProject(null);
              setIsAddingRoot(false);
              setNewTask({ title: '', description: '', parentTaskIds: [], isTerminal: false });
            }}
            size="lg"
            classNames={{
              wrapper: "bg-neutral-950/70 backdrop-blur-sm z-[100]",
              base: "rounded-[2.5rem] shadow-2xl overflow-hidden",
              backdrop: "bg-neutral-950/50",
            }}
            motionProps={{
              variants: {
                enter: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
                exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
              }
            }}
          >
            <ModalContent className="bg-white dark:bg-neutral-900">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (newTask.title.trim() && selectedProjectId) {
                  onAddTask(newTask.title.trim(), newTask.description, [], selectedProjectId, newTask.parentTaskIds, newTask.isTerminal);
                  setIsAddingTaskToProject(null);
                  setIsAddingRoot(false);
                  setNewTask({ title: '', description: '', parentTaskIds: [], isTerminal: false });
                }
              }}>
                <ModalHeader className="flex-col pt-10 pb-2">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {isAddingRoot ? (language === 'zh-TW' ? '新增起始節點' : '添加起始节点') : t.addStep}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    {language === 'zh-TW' ? '為項目添加新的工作流步驟' : '为项目添加新的工作流步骤'}
                  </p>
                </ModalHeader>
                <ModalBody className="gap-5 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      {language === 'zh-TW' ? '步驟名稱' : '步骤名称'}
                    </label>
                    <input
                      autoFocus
                      required
                      className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4 outline-none focus:border-green-500 dark:focus:border-green-400 font-medium text-base transition-colors placeholder:text-neutral-400"
                      placeholder={t.stepName}
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>

                  {/* 终止节点按钮 */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setNewTask({ ...newTask, isTerminal: !newTask.isTerminal })}
                      className={`
                        flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 w-full max-w-sm
                        ${newTask.isTerminal
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }
                      `}
                    >
                      {newTask.isTerminal && <Check className="w-5 h-5" />}
                      <span>{language === 'zh-TW' ? '設為終止節點' : '设为终止节点'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 text-center">
                    {language === 'zh-TW' ? '所有任務完成後到達此節點，項目將標記為已完成' : '所有任务完成后到达此节点，项目将标记为已完成'}
                  </p>
                </ModalBody>
                <ModalFooter className="justify-end gap-3 pt-2 pb-6">
                  <Button
                    variant="bordered"
                    className="rounded-xl px-8 font-semibold border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                    onPress={() => {
                      setIsAddingTaskToProject(null);
                      setIsAddingRoot(false);
                      setNewTask({ title: '', description: '', parentTaskIds: [], isTerminal: false });
                    }}
                  >
                    {t.cancel}
                  </Button>
                  <Button type="submit" color="success" className="rounded-xl px-8 font-semibold border-2 border-green-600">
                    {t.add}
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
        )}

        {editingTask && (
          <Modal
            isOpen={true}
            hideCloseButton
            onClose={() => setEditingTask(null)}
            size="2xl"
            classNames={{
              wrapper: "bg-neutral-950/70 backdrop-blur-sm z-[110]",
              base: "rounded-[2.5rem] shadow-2xl overflow-hidden",
              backdrop: "bg-neutral-950/50",
            }}
            motionProps={{
              variants: {
                enter: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
                exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
              }
            }}
          >
            <ModalContent className="bg-white dark:bg-neutral-900 max-h-[90vh] flex flex-col">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingTask.title.trim()) {
                  onUpdateTask(editingTask.id, editingTask);
                  setEditingTask(null);
                }
              }}>
                <ModalHeader className="flex-col pt-10 pb-4">
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {language === 'zh-TW' ? '管理任務' : '管理任务'}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    {language === 'zh-TW' ? '編輯任務詳情、標籤和里程碑' : '编辑任务详情、标签和里程碑'}
                  </p>
                </ModalHeader>
                <ModalBody className="space-y-6 overflow-y-auto custom-scrollbar flex-1">
                  {/* 任务名称 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      {t.stepName}
                    </label>
                    <input
                      autoFocus
                      required
                      className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4 outline-none focus:border-green-500 dark:focus:border-green-400 font-medium text-base transition-colors"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    />
                  </div>

                  {/* 描述 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      {t.description}
                    </label>
                    <textarea
                      className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4 outline-none focus:border-green-500 dark:focus:border-green-400 font-medium text-base h-28 resize-none transition-colors placeholder:text-neutral-400"
                      placeholder={language === 'zh-TW' ? '添加詳細描述...' : '添加详细描述...'}
                      value={editingTask.description || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    />
                  </div>

                  {/* 标签 */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      {language === 'zh-TW' ? '標籤分類' : '标签分类'}
                    </label>
                    <div className="flex flex-wrap gap-2 p-4 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-neutral-200 dark:border-neutral-700">
                      {(editingTask.tags || []).length > 0 ? (editingTask.tags || []).map(tag => (
                        <Chip
                          key={tag}
                          color={((categories.find(c => c.name === tag)?.color === 'terracotta' ? 'danger' : categories.find(c => c.name === tag)?.color === 'ochre' ? 'warning' : 'default') as "success" | "warning" | "danger" | "default")}
                          onClose={() => setEditingTask({ ...editingTask, tags: editingTask.tags.filter(t => t !== tag) })}
                          className="rounded-lg text-xs"
                        >
                          {tag}
                        </Chip>
                      )) : <span className="text-xs text-neutral-400">{language === 'zh-TW' ? '無標籤' : '无标签'}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.filter(c => !(editingTask.tags || []).includes(c.name)).map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setEditingTask({ ...editingTask, tags: [...(editingTask.tags || []), c.name] })}
                          className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                        >
                          + {c.name}
                        </button>
                      ))}
                    </div>

                    {/* 新建标签 */}
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 block">
                        {language === 'zh-TW' ? '新建標籤' : '新建标签'}
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-2 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_HEX_MAP[newTagColor]?.main || '#84B179' }} />
                          <input
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder={language === 'zh-TW' ? '標籤名稱...' : '标签名称...'}
                            className="bg-transparent border-none outline-none text-sm w-full text-neutral-900 dark:text-white placeholder:text-neutral-400"
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
                          isDisabled={!newTagName.trim()}
                          onPress={() => {
                            if (newTagName.trim()) {
                              onAddCategory(newTagName.trim(), newTagColor);
                              setNewTagName('');
                            }
                          }}
                          className="rounded-xl w-10 h-10 flex items-center justify-center p-0 shrink-0"
                          color="success"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {TAG_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewTagColor(c)}
                            className="w-7 h-7 rounded-lg transition-all duration-200"
                            style={{
                              backgroundColor: COLOR_HEX_MAP[c]?.main || '#84B179',
                              opacity: newTagColor === c ? 1 : 0.4,
                              transform: newTagColor === c ? 'scale(1.1)' : 'scale(1)',
                              boxShadow: newTagColor === c ? `0 0 0 2px white, 0 0 0 4px ${COLOR_HEX_MAP[c]?.main || '#84B179'}` : 'none'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 里程碑 */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      WBS {language === 'zh-TW' ? '里程碑' : '里程碑'}
                    </label>
                    <div className="space-y-2">
                      {(editingTask.milestones || []).map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 group/mile">
                          <div className="flex items-center gap-3">
                            <Flag className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">{m.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingTask({ ...editingTask, milestones: editingTask.milestones.filter(x => x.id !== m.id) })}
                            className="p-2 text-neutral-400 hover:text-red-500 transition-all opacity-0 group-hover/mile:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 outline-none text-sm font-medium focus:border-green-500 dark:focus:border-green-400 transition-all placeholder:text-neutral-400"
                      placeholder={language === 'zh-TW' ? '輸入關鍵節點標題並回車...' : '输入关键节点标题并回车...'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setEditingTask({
                              ...editingTask,
                              milestones: [...(editingTask.milestones || []), {
                                id: Math.random().toString(36).substr(2, 9),
                                title: val,
                                timestamp: Date.now(),
                                branch: 'main'
                              }]
                            });
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </ModalBody>
                <ModalFooter className="justify-end gap-3 pt-4 pb-6 border-t border-neutral-200 dark:border-neutral-700">
                  <Button
                    variant="bordered"
                    className="rounded-xl px-8 font-semibold border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                    onPress={() => setEditingTask(null)}
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    type="submit"
                    color="success"
                    className="rounded-xl px-8 font-semibold border-2 border-green-600"
                  >
                    {language === 'zh-TW' ? '保存更新' : '保存更新'}
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
        )}

        {/* AI Planning Modal */}
        <AIPlanningModal
          isOpen={showAIPlanning}
          onClose={() => setShowAIPlanning(false)}
          projectId={selectedProject.id}
          projectName={projects.find(p => p.id === selectedProject.id)?.name || ''}
          mode={tasks.filter(t => t.projectId === selectedProject.id).length === 0 ? 'zero-state' : 'continuation'}
          existingTasks={tasks.filter(t => t.projectId === selectedProject.id)}
          onConfirm={(taskPreviews) => {
            // Convert TaskPreview to actual Tasks and add them
            taskPreviews.forEach((preview) => {
              onAddTask(
                preview.title,
                preview.description || '',
                preview.tag ? [preview.tag] : [],
                selectedProject.id,
                preview.parentIds || [],
                true
              );
            });
            setShowAIPlanning(false);
          }}
          language={language}
        />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0 px-2">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">{t.projectPlanner}</h2>
          <p className="text-sm font-black text-neutral-400 uppercase tracking-[0.4em] mt-3">{t.projectPlannerDesc}</p>
        </div>
        <Button onClick={handleCreateProject} className="motion-animate rounded-2xl px-8 py-4 text-sm font-semibold shadow-lg bg-green-500 text-white border-2 border-green-600 hover:bg-green-600 transition-colors">
          <GitBranchPlus className="w-4 h-4 mr-2" />
          {t.newProject}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {projects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-1000">
            <div className="w-32 h-32 bg-neutral-50 dark:bg-neutral-800/50 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner">
              <GitBranchPlus className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">{t.noProjectsYet}</h3>
            <p className="text-neutral-400 font-bold max-w-sm mx-auto leading-relaxed mb-8">{t.createProjectHint}</p>
            <Button onClick={handleCreateProject} size="lg" className="motion-animate rounded-2xl px-12 py-4 shadow-xl bg-green-500 text-white font-semibold border-2 border-green-600 hover:bg-green-600 transition-colors">
               {t.newProject}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 px-6 pt-4 auto-rows-fr">
            {displayedProjects.map(project => {
              const pTasks = tasks.filter(tk => tk.projectId === project.id);
              const completed = pTasks.filter(tk => tk.status === TaskStatus.COMPLETED).length;
              const progress = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;

              // Check if project has a terminal node and if it's completed
              const hasTerminal = pTasks.some(tk => tk.isTerminal);
              const terminalCompleted = pTasks.filter(tk => tk.isTerminal && tk.status === TaskStatus.COMPLETED).length > 0;
              const allCompleted = pTasks.length > 0 && pTasks.every(tk => tk.status === TaskStatus.COMPLETED);
              const isProjectCompleted = hasTerminal ? (allCompleted && terminalCompleted) : allCompleted;

              // Aggregate all unique tags from tasks in this project
              const projectTags: string[] = Array.from(new Set(pTasks.flatMap(t => t.tags || [])));

              return (
                <div
                  key={project.id}
                  onClick={() => handleOpenDetail(project.id)}
                  className="group flex flex-col p-4 md:p-5 bg-white dark:bg-neutral-900 rounded-[2rem] h-full min-h-[140px] border border-neutral-200/30 dark:border-neutral-800/30 hover:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.5)] transition-all cursor-pointer relative overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-black/20"
                >
                  {/* Hover 时浮现的箭头提示 */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity">
                    <ChevronRight className="w-6 h-6 text-neutral-400" />
                  </div>

                  {/* 标题行：标题 + 状态徽章 */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-xl md:text-2xl font-black group-hover:text-green-600 truncate transition-colors leading-tight">{project.name}</h3>
                    <span
                      className={`
                        shrink-0 uppercase px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-widest
                        ${isProjectCompleted
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'}
                      `}
                    >
                      {isProjectCompleted ? (language === 'zh-TW' ? '已完成' : '已完成') : (language === 'zh-TW' ? '進行中' : '进行中')}
                    </span>
                  </div>

                  {/* 描述文字 - 更淡的颜色 */}
                  <p className="text-neutral-400 dark:text-neutral-500 text-sm line-clamp-1 leading-relaxed mb-3">{project.description}</p>

                  {/* 水平进度条 */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isProjectCompleted ? 'bg-green-500' : 'bg-neutral-400 dark:bg-neutral-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 tabular-nums w-10 text-right">{progress}%</span>
                  </div>

                  {/* 底部：标签 + 步骤数 */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                      {projectTags.length > 0 && projectTags.slice(0, 3).map(tag => (
                        <Chip key={tag} color={getChipColor(tag)} className="px-2 py-0.5 text-[9px] uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity h-auto rounded-full">
                          {tag}
                        </Chip>
                      ))}
                      {projectTags.length > 3 && (
                        <span className="text-[9px] text-neutral-400 px-1">+{projectTags.length - 3}</span>
                      )}
                    </div>
                    <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500">{completed} / {pTasks.length} {t.stepsCompleted}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {projects.length > ITEMS_PER_PAGE && (
        <div className="shrink-0 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 text-slate-600 dark:text-neutral-400 hover:text-green-600 hover:border-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:hover:shadow-sm font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.ceil(projects.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg font-bold text-sm transition-all border-2 ${
                    currentPage === pageNum
                      ? 'bg-green-500 text-white border-green-600 shadow-lg'
                      : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-slate-600 dark:text-neutral-400 hover:text-green-600 hover:border-green-500'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(projects.length / ITEMS_PER_PAGE), p + 1))}
              disabled={currentPage === Math.ceil(projects.length / ITEMS_PER_PAGE)}
              className="p-2 rounded-xl bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 text-slate-600 dark:text-neutral-400 hover:text-green-600 hover:border-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:hover:shadow-sm font-semibold"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
