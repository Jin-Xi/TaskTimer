
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Zap, Timer as TimerIcon, Moon, Sun, Download, Upload, GitBranchPlus, Languages, Menu, HelpCircle, Key, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Github, CheckCircle } from 'lucide-react';
import { Task, TaskStatus, Milestone, Category, Project, Language } from './types';
import { Navbar, NavbarBrand, NavbarContent, Tabs, Tab, Button } from '@heroui/react';
import {
  subscribeToTasks,
  subscribeToCategories,
  subscribeToProjects,
  addTask,
  updateTask,
  deleteTask,
  deleteTasks,
  addCategory,
  deleteCategory,
  addProject,
  updateProject,
  deleteProject,
  deleteTasksByProjectId,
} from './services/storageService';
import { TaskTimer } from './components/TaskTimer';
import { Logo } from './components/Logo';
import { TaskList } from './components/TaskList';
import { Stats } from './components/Stats';
import { ProjectManager } from './components/ProjectManager';
import { FullscreenFocus } from './components/FullscreenFocus';
import { AISettingsModal } from './components/AISettingsModal';
import { Drawer } from './components/Drawer';
import { TimerToast } from './components/TimerToast';
import { AnimatePresence } from 'framer-motion';
import { AnimatedPage } from './animations';
import { GlobalTimerIndicator } from './components/GlobalTimerIndicator';
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
  const [tabDirection, setTabDirection] = useState(1);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);

  // Drawer exclusive logic
  const handleOpenNav = () => {
    setIsNavOpen(true);
    setIsTaskListOpen(false);
  };

  const handleOpenTaskList = () => {
    setIsTaskListOpen(true);
    setIsNavOpen(false);
  };

  const [language, setLanguage] = useState<'zh-CN' | 'zh-TW'>(() => {
    return (localStorage.getItem('chrono_lang') as 'zh-CN' | 'zh-TW') || 'zh-CN';
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

  // Calculate today's completed tasks
  useEffect(() => {
    const unsubscribe = subscribeToTasks((tasks) => {
      const today = new Date().toDateString();
      const completedToday = tasks.filter(task => {
        if (task.status !== 'COMPLETED') return false;
        // Check milestones for completion timestamp
        const completedMilestone = task.milestones.find(m => m.branch === 'completed');
        const completedTime = completedMilestone
          ? completedMilestone.timestamp
          : task.createdAt;
        return new Date(completedTime).toDateString() === today;
      });
      setTodayCompletedCount(completedToday.length);
    });
    return unsubscribe;
  }, []);

  // Space key shortcut for timer control
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      // Only trigger on Space key when there's an active task
      if (e.code === 'Space' && focusTaskId) {
        e.preventDefault();
        const activeTask = tasks.find(t => t.id === focusTaskId);
        if (activeTask) {
          if (activeTask.status === TaskStatus.RUNNING || activeTask.status === TaskStatus.BREAK) {
            handlePauseTask(focusTaskId);
            setToastMessage('⏸ 已暂停');
            setShowToast(true);
          } else {
            handleStartTask(focusTaskId);
            setToastMessage('▶️ 继续专注');
            setShowToast(true);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [focusTaskId, tasks]);

  const activeTimers = tasks
    .filter(t => t.id === focusTaskId && (t.status === TaskStatus.RUNNING || t.status === TaskStatus.PAUSED || t.status === TaskStatus.BREAK))
    .slice(0, 1);

  const activeFocusTask = tasks.find(t => t.id === focusTaskId) || null;

  const handleAddTask = async (title: string, description: string, tags: string[], projectId?: string, parentTaskIds: string[] = [], isTerminal?: boolean) => {
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
      parentTaskIds,
      isTerminal
    };
    const updated = await addTask(newTask);
    setTasks(updated);
  };

  const handleDeleteTask = async (id: string) => {
    const updated = await deleteTask(id);
    setTasks(updated);
    if (focusTaskId === id) setFocusTaskId(null);
  };

  const handleDeleteTasks = async (ids: string[]) => {
    const updated = await deleteTasks(ids);
    setTasks(updated);
    if (focusTaskId && ids.includes(focusTaskId)) setFocusTaskId(null);
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    const updated = await updateTask(id, updates);
    setTasks(updated);
  };

  const handlePauseTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && (task.status === TaskStatus.RUNNING || task.status === TaskStatus.BREAK)) {
        const lastLogIdx = task.logs.length - 1;
        const now = Date.now();
        const newLogs = [...task.logs];
        const logDuration = now - task.logs[lastLogIdx].start;
        newLogs[lastLogIdx] = { ...task.logs[lastLogIdx], end: now };
        
        const updatedTotalTime = task.status === TaskStatus.RUNNING 
          ? task.totalTime + logDuration 
          : task.totalTime;

        const updated = await updateTask(id, {
            status: TaskStatus.PAUSED,
            totalTime: updatedTotalTime,
            logs: newLogs
        });
        setTasks(updated);
        return updated;
    }
    return tasks;
  };

  const handleStartBreak = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === TaskStatus.BREAK) return;

    if (task.status === TaskStatus.RUNNING) {
      await handlePauseTask(id);
    }

    const updated = await updateTask(id, {
        status: TaskStatus.BREAK,
        logs: [...task.logs, { start: Date.now(), end: null }]
    });
    setTasks(updated);
  };

  const handleDismissFocus = async (id: string) => {
    await handlePauseTask(id);
    setFocusTaskId(null);
  };

  const handleStartTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === TaskStatus.RUNNING) return;

    if (task.parentTaskIds?.length > 0) {
      const unfinished = tasks.filter(t => task.parentTaskIds.includes(t.id) && t.status !== TaskStatus.COMPLETED);
      if (unfinished.length > 0) {
        alert(`请先完成前置任务：${unfinished.map(p => p.title).join(', ')}`);
        return;
      }
    }

    const runningTask = tasks.find(t => t.status === TaskStatus.RUNNING || t.status === TaskStatus.BREAK);
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

  const handleDeleteProject = async (id: string) => {
    // Delete all tasks in the project first
    const updatedTasks = await deleteTasksByProjectId(id);
    setTasks(updatedTasks);

    // Delete the project
    const updatedProjects = await deleteProject(id);
    setProjects(updatedProjects);

    // Clear focus if the focused task was in the deleted project
    if (activeFocusTask && activeFocusTask.projectId === id) {
      setIsFocusMode(false);
      setFocusTaskId(null);
    }
  };

  const getSuggestedTasks = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      return ['总结日志', '准备明日待办', '放松听歌'];
    } else if (hour >= 11 && hour < 17) {
      return ['深度编码', '核心架构设计', '午间冥想'];
    } else {
      return ['复盘今日', '代码审计', '学习新技术'];
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
      onDeleteMany={handleDeleteTasks}
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
    <div className="flex flex-col h-full py-8 md:py-10 px-6">
      <div className="flex items-center gap-4 px-2 shrink-0 mb-8 animate-in fade-in slide-in-from-left-2 duration-500">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-green/20">
          <TimerIcon className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight uppercase font-sans">{APP_NAME}</h1>
      </div>

      <nav className="flex-1 flex flex-col space-y-3">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                const currentIndex = NAV_ITEMS.findIndex(nav => nav.id === activeTab);
                const newIndex = NAV_ITEMS.findIndex(nav => nav.id === item.id);
                setTabDirection(newIndex > currentIndex ? 1 : -1);
                setActiveTab(item.id);
                setIsNavOpen(false);
              }}
              className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-green-400 text-white shadow-lg shadow-green/25 scale-[1.02]'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900/50 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-green-100' : 'text-neutral-400 group-hover:text-green-500'}`} />
              <span className="uppercase tracking-wider">{(t as any)[item.labelKey]}</span>
              {isActive && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          );
        })}
      </nav>

      <div className="pt-8 flex flex-col gap-3 shrink-0 border-t border-neutral-200 dark:border-neutral-700 mt-4">
        <button
          onClick={() => setShowAISettings(true)}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <Key className="w-4 h-4" />
          {t.aiSettings}
        </button>
        <div className="flex gap-4">
           <button onClick={() => setDarkMode(!darkMode)} className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-green-500/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm hover:shadow-md group">
             {darkMode ? <Sun className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" /> : <Moon className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />}
             <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-neutral-500 dark:group-hover:text-neutral-300">{darkMode ? t.lightMode : t.darkMode}</span>
           </button>
           <button onClick={() => setLanguage(language === 'zh-CN' ? 'zh-TW' : 'zh-CN')} className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 hover:border-green-500/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shadow-sm hover:shadow-md group">
             <Languages className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-neutral-500 dark:group-hover:text-neutral-300">{t.langName}</span>
           </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 font-sans text-neutral-900 dark:text-neutral-100 overflow-hidden relative selection:bg-green-400/20">
      {/* Navigation Drawer */}
      <Drawer
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        ariaLabel="导航菜单"
      >
        <SidebarContent />
      </Drawer>

      {/* Main Container */}
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden min-w-0 bg-neutral-50 dark:bg-neutral-900">
        {/* Top Navigation Bar using HeroUI Navbar */}
        <Navbar
          maxWidth="full"
          isBordered
          classNames={{
            base: "bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-700",
            wrapper: "px-4",
          }}
        >
          {/* Mobile: Navigation Menu Button */}
          <NavbarContent className="flex sm:hidden">
            <Button
              isIconOnly
              size="sm"
              color="default"
              variant="light"
              onPress={handleOpenNav}
              aria-label="打开导航菜单"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </NavbarContent>

          {/* Left: Logo + System Name */}
          <NavbarBrand className="gap-3">
            <Logo variant="icon" size={32} />
            <span className="font-bold text-xl text-neutral-900 dark:text-neutral-100">
              {APP_NAME}
            </span>
          </NavbarBrand>

          {/* Center: Tabs for navigation */}
          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => {
                const currentIndex = NAV_ITEMS.findIndex(nav => nav.id === activeTab);
                const newIndex = NAV_ITEMS.findIndex(nav => nav.id === key);
                setTabDirection(newIndex > currentIndex ? 1 : -1);
                setActiveTab(key as string);
              }}
              variant="underlined"
              color="success"
              classNames={{
                base: "gap-6",
                tabList: "gap-6",
                cursor: "bg-green-400",
                tab: "px-0 py-2 h-auto",
                tabContent: "group-data-[selected=true]:text-green-500 font-semibold text-neutral-500 dark:text-neutral-400",
              }}
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Tab
                    key={item.id}
                    title={
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{(t as any)[item.labelKey]}</span>
                      </span>
                    }
                  />
                );
              })}
            </Tabs>
          </NavbarContent>

          {/* Right: Settings, Dark Mode, Today's Count, GitHub */}
          <NavbarContent justify="end" className="gap-3">
            {/* AI Settings Button */}
            <Button
              isIconOnly
              size="sm"
              color="default"
              variant="light"
              onPress={() => setShowAISettings(true)}
              aria-label="AI 设置"
            >
              <Key className="w-4 h-4" />
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              isIconOnly
              size="sm"
              color="default"
              variant="light"
              onPress={() => {
                const newMode = !darkMode;
                setDarkMode(newMode);
                localStorage.setItem('chrono_dark_mode', JSON.stringify(newMode));
                if (newMode) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              }}
              aria-label="切换深色模式"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Today's Completed Count */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <span>今日完成: {todayCompletedCount}</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>

            {/* GitHub Link */}
            <a
              href="https://github.com/Jin-Xi/TaskTimer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>
          </NavbarContent>
        </Navbar>

        {/* Task List Hamburger Button - 水滴状紧贴右侧边框 */}
        {/* Task List Hamburger Button - 水滴状紧贴右侧边框 */}
        <button
          onClick={handleOpenTaskList}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-l-full rounded-r-lg transition-all motion-press border-l border-t border-b border-slate-200 dark:border-slate-700 shadow-lg z-40 hover:pr-5"
          aria-label="打开任务清单"
          aria-expanded={isTaskListOpen}
          data-testid="task-list-hamburger-button"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Main Content Area Wrapper */}
        <div className="flex-1 flex flex-col min-h-0 relative" data-testid="main-content-wrapper">
          {/* Tab Content Section */}
          <section className="flex-1 flex flex-col overflow-hidden" data-testid="tab-content-section">
            <AnimatePresence mode="wait" initial={false}>
              {activeTab === 'tasks' && (
                <AnimatedPage key="tasks" direction={tabDirection} className="flex-1 flex items-center justify-center p-4 md:px-10">
                  {/* Task Timer Container */}
                  <div className="w-full max-w-[1600px] mx-auto" data-testid="task-timer-container">
                    <TaskTimer
                      language={language}
                      activeTasks={activeTimers}
                      onStart={handleStartTask}
                      onPause={handlePauseTask}
                      onBreak={handleStartBreak}
                      onComplete={async (id) => { await handleUpdateTask(id, {status: TaskStatus.COMPLETED}); if(focusTaskId===id)setFocusTaskId(null); }}
                      onAddTask={handleAddTask}
                      onAddMilestone={handleAddMilestoneWithDependency}
                      onEditMilestone={handleEditMilestone}
                      onDeleteMilestone={handleDeleteMilestone}
                      onEnterFocusMode={(id) => { setFocusTaskId(id); setIsFocusMode(true); }}
                      onDismiss={handleDismissFocus}
                      suggestedTasks={getSuggestedTasks()}
                      categories={categories}
                    />
                  </div>
                </AnimatedPage>
              )}
              {activeTab === 'projects' && (
                <AnimatedPage key="projects" direction={tabDirection} className="flex-1 flex items-stretch justify-center p-4 md:px-10">
                  <div className="w-full max-w-[1600px] mx-auto">
                    <ProjectManager
                      language={language}
                      projects={projects}
                      tasks={tasks}
                      onAddProject={async (data) => {
                        const updated = await addProject({
                          ...data,
                          id: generateUUID(),
                          createdAt: Date.now()
                        } as Project);
                        setProjects(updated);
                      }}
                      onUpdateProject={async (id, data) => {
                        const updated = await updateProject(id, data);
                        setProjects(updated);
                      }}
                      onDeleteProject={handleDeleteProject}
                      onAddTask={handleAddTask}
                      onDeleteTask={handleDeleteTask}
                      onUpdateTask={handleUpdateTask}
                      categories={categories}
                      onAddCategory={async (n, c) => {
                        const updated = await addCategory({id: generateUUID(), name: n, color: c});
                        setCategories(updated);
                      }}
                    />
                  </div>
                </AnimatedPage>
              )}
              {activeTab === 'dashboard' && (
                <AnimatedPage key="dashboard" direction={tabDirection} className="flex-1 flex items-center justify-center p-4 md:px-10">
                  <div className="w-full max-w-[1600px] mx-auto">
                    <Stats language={language} tasks={tasks} projects={projects} />
                  </div>
                </AnimatedPage>
              )}
            </AnimatePresence>
          </section>

          {/* Global Timer Indicator - 正常布局流，贴在底部 */}
          {activeFocusTask && (
            <div data-testid="global-timer-indicator-wrapper">
              <GlobalTimerIndicator
                activeTask={activeFocusTask}
                onToggleTimer={() => {
                  if (activeFocusTask.status === TaskStatus.RUNNING || activeFocusTask.status === TaskStatus.BREAK) {
                    handlePauseTask(activeFocusTask.id);
                  } else {
                    handleStartTask(activeFocusTask.id);
                  }
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Task List Drawer */}
      <Drawer
        isOpen={isTaskListOpen}
        onClose={() => setIsTaskListOpen(false)}
        position="right"
        ariaLabel="任务清单"
      >
        <div className="p-6">
          <h2 className="text-xl font-black text-neutral-900 dark:text-white mb-4">{t.taskExplorer}</h2>
          <SharedTaskList />
        </div>
      </Drawer>

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

      {showAISettings && (
        <AISettingsModal language={language} onClose={() => setShowAISettings(false)} />
      )}

      {/* Timer Toast */}
      <TimerToast message={toastMessage} isVisible={showToast} />
    </div>
  );
};

export default App;
