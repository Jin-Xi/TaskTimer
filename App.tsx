
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ListTodo, Zap, Timer as TimerIcon, Moon, Sun, Download, Upload, GitBranchPlus, Languages, Menu, X as CloseIcon } from 'lucide-react';
import { Task, TaskStatus, Milestone, Category, Project } from './types';
import { 
  subscribeToTasks, 
  subscribeToCategories, 
  subscribeToProjects, 
  addTask, 
  updateTask, 
  deleteTask, 
  addCategory, 
  deleteCategory, 
  addProject, 
  deleteProject,
  downloadTasksAsJson, 
  validateImportedData 
} from './services/storageService';
import { TaskTimer } from './components/TaskTimer';
import { TaskList } from './components/TaskList';
import { Stats } from './components/Stats';
import { AIInsights } from './components/AIInsights';
import { ProjectManager } from './components/ProjectManager';
import { FullscreenFocus } from './components/FullscreenFocus';
import { APP_NAME, NAV_ITEMS, DEFAULT_CATEGORIES, TRANSLATIONS } from './constants';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [language, setLanguage] = useState<'en' | 'zh'>(() => {
    return (localStorage.getItem('chrono_lang') as 'en' | 'zh') || 'zh';
  });

  const t = TRANSLATIONS[language];
  const [focusBgImage, setFocusBgImage] = useState<string | null>(() => localStorage.getItem('chrono_focus_bg'));
  const fileImportRef = useRef<HTMLInputElement>(null);
  
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('chrono_dark_mode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('chrono_dark_mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('chrono_lang', language);
  }, [language]);

  useEffect(() => {
    const unsubTasks = subscribeToTasks(setTasks);
    const unsubCats = subscribeToCategories(setCategories, DEFAULT_CATEGORIES);
    const unsubProjs = subscribeToProjects(setProjects);
    return () => { unsubTasks(); unsubCats(); unsubProjs(); };
  }, []);

  const activeTimers = tasks
    .filter(t => t.status === TaskStatus.RUNNING || t.status === TaskStatus.PAUSED)
    .sort((a, b) => (b.logs[b.logs.length - 1]?.start || 0) - (a.logs[a.logs.length - 1]?.start || 0))
    .slice(0, 3);

  const activeFocusTask = tasks.find(t => t.id === focusTaskId) || null;

  const handleAddTask = async (title: string, description: string, tags: string[], projectId?: string, parentTaskIds: string[] = []) => {
    let finalTags = tags;
    if (tags.length === 0) {
      if (categories.length > 0) {
        finalTags = [categories[0].name];
      } else {
        finalTags = [language === 'zh' ? '常规' : 'General'];
      }
    }

    const newTask: Task = {
      id: generateUUID(),
      title,
      description,
      tags: finalTags,
      status: TaskStatus.IDLE,
      totalTime: 0,
      createdAt: Date.now(),
      logs: [],
      milestones: [],
      projectId,
      parentTaskIds
    };
    const updated = await addTask(newTask);
    setTasks(updated);
  };

  const handleDeleteTask = async (id: string) => {
    const updated = await deleteTask(id);
    setTasks(updated);
    if (focusTaskId === id) setFocusTaskId(null);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    const updated = await updateTask(id, updates);
    setTasks(updated);
  };

  const handleStartTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === TaskStatus.RUNNING) return;
    if (tasks.filter(t => t.status === TaskStatus.RUNNING).length >= 3) return alert(t.taskLimitReached);

    if (task.parentTaskIds?.length > 0) {
      const unfinished = tasks.filter(t => task.parentTaskIds.includes(t.id) && t.status !== TaskStatus.COMPLETED);
      if (unfinished.length > 0) return alert(language === 'zh' ? `请先完成前置任务：${unfinished.map(p => p.title).join(', ')}` : `Prerequisites needed: ${unfinished.map(p => p.title).join(', ')}`);
    }

    setFocusTaskId(id);
    const updated = await updateTask(id, {
        status: TaskStatus.RUNNING,
        logs: [...task.logs, { start: Date.now(), end: null }]
    });
    setTasks(updated);
  };

  const handlePauseTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && task.status === TaskStatus.RUNNING) {
        const lastLogIdx = task.logs.length - 1;
        const now = Date.now();
        const newLogs = [...task.logs];
        newLogs[lastLogIdx] = { ...task.logs[lastLogIdx], end: now };
        const updated = await updateTask(id, {
            status: TaskStatus.PAUSED,
            totalTime: task.totalTime + (now - task.logs[lastLogIdx].start),
            logs: newLogs
        });
        setTasks(updated);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between md:justify-start gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/20"><TimerIcon className="w-5 h-5" /></div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{APP_NAME}</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <button 
              key={item.id} 
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <Icon className="w-4 h-4" /> {(t as any)[item.labelKey]}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
         <div className="grid grid-cols-2 gap-2">
           <button onClick={() => setDarkMode(!darkMode)} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-[10px] font-bold bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
             {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />} {darkMode ? t.lightMode : t.darkMode}
           </button>
           <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-[10px] font-bold bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
             <Languages className="w-3.5 h-3.5" /> {t.langName}
           </button>
         </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <input type="file" ref={fileImportRef} className="hidden" accept=".json" onChange={(e) => {}} />

      {isFocusMode && activeFocusTask && (
        <FullscreenFocus 
          language={language}
          activeTask={activeFocusTask}
          onToggleStatus={(id) => tasks.find(t => t.id === id)?.status === TaskStatus.RUNNING ? handlePauseTask(id) : handleStartTask(id)}
          onExit={() => setIsFocusMode(false)}
          backgroundImage={focusBgImage}
          onSetBackgroundImage={(url) => { setFocusBgImage(url); localStorage.setItem('chrono_focus_bg', url); }}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/60 dark:border-slate-800/80 hidden md:flex flex-col z-10 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-slate-900 z-[60] md:hidden flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><TimerIcon className="w-5 h-5" /></div>
            <h1 className="font-bold text-slate-800 dark:text-white tracking-tight">{APP_NAME}</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-hidden p-4 md:p-8 max-w-7xl mx-auto w-full">
            {activeTab === 'tasks' && (
                <div className="flex flex-col h-full gap-6">
                    <TaskTimer language={language} activeTasks={activeTimers} onStart={handleStartTask} onPause={handlePauseTask} onComplete={async (id) => { await handleUpdateTask(id, {status: TaskStatus.COMPLETED}); setFocusTaskId(null); }} onAddMilestone={async (id, title, br) => { const task = tasks.find(t => t.id === id); if (task) await handleUpdateTask(id, { milestones: [...task.milestones, { id: generateUUID(), title, timestamp: Date.now(), branch: br }] }); }} onEnterFocusMode={(id) => { setFocusTaskId(id); setIsFocusMode(true); }} />
                    <div className="flex-1 min-h-0">
                        <TaskList language={language} tasks={tasks} projects={projects} activeTaskId={null} onAdd={handleAddTask} onDelete={handleDeleteTask} onSelect={handleStartTask} onAddMilestone={async (id, title, br) => { const task = tasks.find(t => t.id === id); if (task) await handleUpdateTask(id, { milestones: [...task.milestones, { id: generateUUID(), title, timestamp: Date.now(), branch: br }] }); }} onEditMilestone={async (id, mid, up) => { const task = tasks.find(t => t.id === id); if (task) await handleUpdateTask(id, { milestones: task.milestones.map(m => m.id === mid ? {...m, ...up} : m) }); }} categories={categories} onAddCategory={async (n, c) => { const updated = await addCategory({id: generateUUID(), name: n, color: c}); setCategories(updated); }} onDeleteCategory={async (id) => { const updated = await deleteCategory(id); setCategories(updated); }} />
                    </div>
                </div>
            )}
            {activeTab === 'projects' && <ProjectManager language={language} projects={projects} tasks={tasks} onAddProject={async (n, d, c) => { const updated = await addProject({id: generateUUID(), name: n, description: d, color: c, createdAt: Date.now()}); setProjects(updated); }} onDeleteProject={async (id) => { const updated = await deleteProject(id); setProjects(updated); }} onAddTask={handleAddTask} onDeleteTask={handleDeleteTask} onUpdateTask={handleUpdateTask} categories={categories} />}
            {activeTab === 'dashboard' && <div className="h-full overflow-y-auto custom-scrollbar"><Stats language={language} tasks={tasks} /></div>}
            {activeTab === 'ai-insights' && <AIInsights language={language} tasks={tasks} />}
        </div>
      </main>
    </div>
  );
};

export default App;
