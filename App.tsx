
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

  // Show the task identified by focusTaskId if it's currently RUNNING or PAUSED.
  // This ensures that pausing a task doesn't hide the card, only Dismiss does.
  const activeTimers = tasks
    .filter(t => t.id === focusTaskId && (t.status === TaskStatus.RUNNING || t.status === TaskStatus.PAUSED))
    .slice(0, 1);

  const activeFocusTask = tasks.find(t => t.id === focusTaskId) || null;

  const handleAddTask = async (title: string, description: string, tags: string[], projectId?: string, parentTaskIds: string[] = []) => {
    const newTask: Task = {
      id: generateUUID(),
      title,
      description,
      tags: tags,
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
        return updated;
    }
    return tasks;
  };

  const handleDismissFocus = async (id: string) => {
    await handlePauseTask(id);
    setFocusTaskId(null);
  };

  const handleStartTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === TaskStatus.RUNNING) return;

    // Check prerequisites
    if (task.parentTaskIds?.length > 0) {
      const unfinished = tasks.filter(t => task.parentTaskIds.includes(t.id) && t.status !== TaskStatus.COMPLETED);
      if (unfinished.length > 0) {
        alert(language === 'zh' ? `请先完成前置任务：${unfinished.map(p => p.title).join(', ')}` : `Prerequisites needed: ${unfinished.map(p => p.title).join(', ')}`);
        return;
      }
    }

    // Auto-pause any currently running task (ensuring only one at a time)
    const runningTask = tasks.find(t => t.status === TaskStatus.RUNNING);
    if (runningTask && runningTask.id !== id) {
      await handlePauseTask(runningTask.id);
    }

    setFocusTaskId(id);
    setActiveTab('tasks');
    
    const updated = await updateTask(id, {
        status: TaskStatus.RUNNING,
        logs: [...task.logs, { start: Date.now(), end: null }]
    });
    setTasks(updated);
  };

  const handleEditMilestone = async (taskId: string, milestoneId: string, milestoneUpdates: Partial<Milestone>) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newMilestones = task.milestones.map(m => m.id === milestoneId ? { ...m, ...milestoneUpdates } : m);
      await handleUpdateTask(taskId, { milestones: newMilestones });
    }
  };

  const handleDeleteMilestone = async (taskId: string, milestoneId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newMilestones = task.milestones.filter(m => m.id !== milestoneId);
      await handleUpdateTask(taskId, { milestones: newMilestones });
    }
  };

  const handleAddMilestoneWithDependency = async (taskId: string, title: string, branch: string, parentMilestoneId: string | null, taskTime: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newM: Milestone = {
        id: generateUUID(),
        title,
        timestamp: Date.now(),
        branch,
        parentMilestoneId,
        taskTime
      };
      await handleUpdateTask(taskId, { milestones: [...task.milestones, newM] });
    }
  };

  const getSuggestedTasks = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      return language === 'zh' ? ['总结日志', '准备明日待办', '放松听歌'] : ['Daily Log', 'Prep Tomorrow', 'Relax & Music'];
    } else if (hour >= 11 && hour < 17) {
      return language === 'zh' ? ['深度编码', '核心架构设计', '午间冥想'] : ['Deep Coding', 'Architecture Design', 'Lunch Meditation'];
    } else {
      return language === 'zh' ? ['复盘今日', '代码审计', '学习新技术'] : ['Daily Review', 'Code Audit', 'Learn New Tech'];
    }
  };

  const SharedTaskList = () => (
    <TaskList 
      language={language} 
      tasks={tasks} 
      projects={projects} 
      activeTaskId={null} 
      onAdd={handleAddTask} 
      onDelete={handleDeleteTask} 
      onSelect={(id) => {
        const t = tasks.find(x => x.id === id);
        if (t?.status === TaskStatus.RUNNING) {
          handlePauseTask(id);
        } else {
          handleStartTask(id);
        }
      }} 
      onUpdate={handleUpdateTask}
      onAddMilestone={async (id, title, br) => { 
        const task = tasks.find(t => t.id === id); 
        if (task) await handleAddMilestoneWithDependency(id, title, br, task.milestones.length > 0 ? task.milestones[task.milestones.length - 1].id : null, task.totalTime); 
      }} 
      onEditMilestone={handleEditMilestone} 
      categories={categories} 
      onAddCategory={async (n, c) => { const updated = await addCategory({id: generateUUID(), name: n, color: c}); setCategories(updated); }} 
      onDeleteCategory={async (id) => { const updated = await deleteCategory(id); setCategories(updated); }} 
    />
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-10 px-6">
      {/* Logo Top */}
      <div className="flex items-center gap-4 px-2 shrink-0">
        <div className="w-10 h-10 bg-indigo-600 rounded-[1rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
          <TimerIcon className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{APP_NAME}</h1>
      </div>

      {/* Centered Navigation Tabs */}
      <nav className="flex-1 flex flex-col justify-center space-y-4 my-8">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }} 
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black transition-all group ${isActive ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`} />
              <span className="uppercase tracking-widest">{(t as any)[item.labelKey]}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="pt-8 flex gap-3 shrink-0">
           <button onClick={() => setDarkMode(!darkMode)} className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all shadow-sm">
             {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
             <span className="text-[8px] font-black uppercase tracking-widest">{darkMode ? t.lightMode : t.darkMode}</span>
           </button>
           <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500 transition-all shadow-sm">
             <Languages className="w-4 h-4 text-indigo-500" />
             <span className="text-[8px] font-black uppercase tracking-widest">{t.langName}</span>
           </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#fcfdfe] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* COLUMN 1: LEFT NAV */}
      <aside className="w-[280px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 hidden lg:flex flex-col z-20 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <aside className={`fixed inset-0 z-[60] lg:hidden transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
        <div className="absolute top-0 bottom-0 left-0 w-[280px] bg-white dark:bg-slate-900 shadow-2xl">
          <SidebarContent />
        </div>
      </aside>

      {/* COLUMN 2: MIDDLE Dynamic Content (Vertically and Horizontally Centered) */}
      <main className="flex-1 relative animate-in fade-in duration-500 flex flex-col min-h-screen overflow-y-auto custom-scrollbar">
        {/* Mobile Header (Fixed Top) */}
        <header className="lg:hidden sticky top-0 left-0 right-0 flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><TimerIcon className="w-4 h-4" /></div>
            <h1 className="font-black text-lg tracking-tight uppercase">{APP_NAME}</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content Centering Area */}
        <div className="flex-grow flex flex-col items-center">
          <div className="w-full h-full max-w-5xl px-4 sm:px-6 lg:px-12 flex flex-col">
            
            {/* Main Area: Perfect Centering with Vertical Padding for Breathability */}
            <section className="flex-grow flex flex-col justify-center items-center py-10 min-h-full">
              <div className="w-full flex flex-col items-center justify-center max-w-full">
                {activeTab === 'tasks' && (
                  <TaskTimer 
                    language={language} 
                    activeTasks={activeTimers} 
                    onStart={handleStartTask} 
                    onPause={handlePauseTask} 
                    onComplete={async (id) => { await handleUpdateTask(id, {status: TaskStatus.COMPLETED}); if(focusTaskId===id)setFocusTaskId(null); }} 
                    onAddTask={handleAddTask}
                    onAddMilestone={handleAddMilestoneWithDependency}
                    onEditMilestone={handleEditMilestone}
                    onDeleteMilestone={handleDeleteMilestone}
                    onEnterFocusMode={(id) => { setFocusTaskId(id); setIsFocusMode(true); }} 
                    onDismiss={handleDismissFocus}
                    suggestedTasks={getSuggestedTasks()}
                  />
                )}
                {activeTab === 'projects' && <ProjectManager language={language} projects={projects} tasks={tasks} onAddProject={async (n, d, c) => { const updated = await addProject({id: generateUUID(), name: n, description: d, color: c, createdAt: Date.now()}); setProjects(updated); }} onDeleteProject={async (id) => { const updated = await deleteProject(id); setProjects(updated); }} onAddTask={handleAddTask} onDeleteTask={handleDeleteTask} onUpdateTask={handleUpdateTask} categories={categories} />}
                {activeTab === 'dashboard' && <Stats language={language} tasks={tasks} />}
                {activeTab === 'ai-insights' && <AIInsights language={language} tasks={tasks} />}
              </div>

              {/* Task List (Stacked only for screens smaller than xl, with clear separation) */}
              <div className="xl:hidden w-full mt-20 md:mt-24 pt-12 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-1 h-5 rounded-full bg-indigo-500" />
                   <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.taskExplorer}</h2>
                </div>
                <SharedTaskList />
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* COLUMN 3: RIGHT TASK LIST (Always-on Sidebar for xl screens) - 30% width */}
      <aside className="w-[30%] min-w-[420px] bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 hidden xl:flex flex-col z-20 shrink-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-10">
            <SharedTaskList />
        </div>
      </aside>

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
    </div>
  );
};

export default App;
