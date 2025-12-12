import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ListTodo, Zap, Timer as TimerIcon, Moon, Sun, Download, Upload } from 'lucide-react';
import { Task, TaskStatus, Milestone } from './types';
import { saveTasks, loadTasks, downloadTasksAsJson, validateImportedData } from './services/storageService';
import { TaskTimer } from './components/TaskTimer';
import { TaskList } from './components/TaskList';
import { Stats } from './components/Stats';
import { AIInsights } from './components/AIInsights';
import { FullscreenFocus } from './components/FullscreenFocus';
import { APP_NAME, NAV_ITEMS } from './constants';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusBgImage, setFocusBgImage] = useState<string | null>(() => {
    return localStorage.getItem('chrono_focus_bg') || null;
  });
  const fileImportRef = useRef<HTMLInputElement>(null);
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chrono_dark_mode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply Dark Mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chrono_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chrono_dark_mode', 'false');
    }
  }, [darkMode]);

  // Load data on mount
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
    const running = loaded.find(t => t.status === TaskStatus.RUNNING);
    if (running) setActiveTaskId(running.id);
  }, []);

  // Save on change
  useEffect(() => {
    if (tasks.length > 0) saveTasks(tasks);
  }, [tasks]);

  const activeTask = tasks.find(t => t.id === activeTaskId) || null;

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleExportData = () => {
    downloadTasksAsJson(tasks);
  };

  const handleImportTrigger = () => {
    fileImportRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validatedTasks = validateImportedData(json);
        
        if (validatedTasks) {
          if (window.confirm(`Found ${validatedTasks.length} tasks in file. This will REPLACE your current tasks. Continue?`)) {
            setTasks(validatedTasks);
            // Stop any currently running tasks from the old state
            setActiveTaskId(null); 
            // Save immediately to storage
            saveTasks(validatedTasks);
            alert("Tasks imported successfully!");
          }
        } else {
          alert("Invalid file format. Please upload a valid ChronoFlow JSON backup.");
        }
      } catch (error) {
        console.error(error);
        alert("Failed to parse file.");
      }
      // Reset input value so same file can be selected again if needed
      if (fileImportRef.current) fileImportRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleSetFocusBg = (url: string) => {
    setFocusBgImage(url);
    try {
      localStorage.setItem('chrono_focus_bg', url);
    } catch (e) {
      console.error("Failed to save bg image", e);
    }
  };

  const handleAddTask = (title: string, category: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      category,
      status: TaskStatus.IDLE,
      totalTime: 0,
      createdAt: Date.now(),
      logs: [],
      milestones: []
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleDeleteTask = (id: string) => {
    if (activeTaskId === id) setActiveTaskId(null);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddMilestone = (taskId: string, title: string, branch: string = 'main') => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          milestones: [
            ...(t.milestones || []), // Ensure array exists for older data
            {
              id: crypto.randomUUID(),
              title,
              timestamp: Date.now(),
              branch
            }
          ]
        };
      }
      return t;
    }));
  };

  const handleEditMilestone = (taskId: string, milestoneId: string, updates: Partial<Milestone>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          milestones: t.milestones.map(m => 
            m.id === milestoneId ? { ...m, ...updates } : m
          )
        };
      }
      return t;
    }));
  };

  const handleStartTask = (id: string) => {
    // Stop currently running task if any
    setTasks(prev => prev.map(t => {
      if (t.status === TaskStatus.RUNNING && t.id !== id) {
        const lastLog = t.logs[t.logs.length - 1];
        const newLogs = [...t.logs];
        if (lastLog && !lastLog.end) {
            // Close the dangling log
            newLogs[newLogs.length - 1] = { ...lastLog, end: Date.now() };
        }
        return {
          ...t,
          status: TaskStatus.PAUSED,
          totalTime: t.totalTime + (Date.now() - (lastLog?.start || Date.now())),
          logs: newLogs
        };
      }
      return t;
    }));

    // Start target task
    setActiveTaskId(id);
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: TaskStatus.RUNNING,
          logs: [...t.logs, { start: Date.now(), end: null }]
        };
      }
      return t;
    }));
  };

  const handlePauseTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id && t.status === TaskStatus.RUNNING) {
        const lastLogIdx = t.logs.length - 1;
        const lastLog = t.logs[lastLogIdx];
        const now = Date.now();
        
        // Update the log
        const newLogs = [...t.logs];
        if (lastLog) {
            newLogs[lastLogIdx] = { ...lastLog, end: now };
        }

        return {
          ...t,
          status: TaskStatus.PAUSED,
          totalTime: t.totalTime + (now - lastLog.start),
          logs: newLogs
        };
      }
      return t;
    }));
  };

  const handleToggleTaskStatus = (id: string) => {
      const task = tasks.find(t => t.id === id);
      if (!task) return;
      if (task.status === TaskStatus.RUNNING) {
          handlePauseTask(id);
      } else {
          handleStartTask(id);
      }
  };

  const handleCompleteTask = (id: string) => {
    handlePauseTask(id); // Ensure time is captured
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: TaskStatus.COMPLETED } : t
    ));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  return (
    <div className="flex h-screen bg-transparent font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hidden File Input for Import */}
      <input 
        type="file" 
        ref={fileImportRef}
        className="hidden"
        accept=".json"
        onChange={handleFileImport}
      />

      {/* Fullscreen Focus Mode */}
      {isFocusMode && activeTask && (
        <FullscreenFocus 
          activeTask={activeTask}
          onToggleStatus={handleToggleTaskStatus}
          onExit={() => setIsFocusMode(false)}
          backgroundImage={focusBgImage}
          onSetBackgroundImage={handleSetFocusBg}
        />
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-r border-slate-200/60 dark:border-slate-800/60 hidden md:flex flex-col transition-colors duration-200 shadow-sm z-10">
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <TimerIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{APP_NAME}</h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-white/50 dark:bg-slate-900/50">
           {/* Dark Mode Toggle */}
           <button
             onClick={toggleDarkMode}
             className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
           >
             {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
             {darkMode ? 'Light Mode' : 'Dark Mode'}
           </button>

           {/* Import / Export Controls */}
           <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportData}
                className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Save backup file"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={handleImportTrigger}
                className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Load backup file"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-6 h-6 text-indigo-600" />
            <h1 className="font-bold text-slate-900 dark:text-white">{APP_NAME}</h1>
          </div>
          <div className="flex gap-1 items-center">
            <button onClick={handleExportData} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                <Download className="w-5 h-5" />
            </button>
            <button onClick={handleImportTrigger} className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">
                <Upload className="w-5 h-5" />
            </button>
             <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button onClick={toggleDarkMode} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {NAV_ITEMS.map(item => (
                <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)}
                    className={`p-2 rounded-md ${activeTab === item.id ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <item.icon className="w-5 h-5" />
                </button>
            ))}
          </div>
        </div>

        {/* Content Area - Reduced padding and gaps */}
        <div className="flex-1 overflow-hidden flex flex-col p-3 md:p-5 max-w-7xl mx-auto w-full gap-3 md:gap-4 z-0">
            
            {/* Always show Timer on Tasks Tab */}
            {activeTab === 'tasks' && (
                <div className="flex flex-col h-full gap-3 md:gap-4">
                    <div className="flex-shrink-0">
                         <TaskTimer 
                            activeTask={activeTask}
                            onStart={handleStartTask}
                            onPause={handlePauseTask}
                            onComplete={handleCompleteTask}
                            onAddMilestone={handleAddMilestone}
                            onEnterFocusMode={() => setIsFocusMode(true)}
                        />
                    </div>
                    <div className="flex-1 min-h-0">
                        <TaskList 
                            tasks={tasks} 
                            activeTaskId={activeTaskId}
                            onAdd={handleAddTask}
                            onDelete={handleDeleteTask}
                            onSelect={handleStartTask}
                            onAddMilestone={handleAddMilestone}
                            onEditMilestone={handleEditMilestone}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'dashboard' && <Stats tasks={tasks} />}
            
            {activeTab === 'ai-insights' && <AIInsights tasks={tasks} />}

        </div>
      </main>
    </div>
  );
};

export default App;