import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ListTodo, Zap, Timer as TimerIcon } from 'lucide-react';
import { Task, TaskStatus, Milestone } from './types';
import { saveTasks, loadTasks } from './services/storageService';
import { TaskTimer } from './components/TaskTimer';
import { TaskList } from './components/TaskList';
import { Stats } from './components/Stats';
import { AIInsights } from './components/AIInsights';
import { APP_NAME, NAV_ITEMS } from './constants';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tasks');

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

  const handleCompleteTask = (id: string) => {
    handlePauseTask(id); // Ensure time is captured
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: TaskStatus.COMPLETED } : t
    ));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <TimerIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{APP_NAME}</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
           <div className="text-xs text-slate-400 text-center">
             Frontend Mode (React)
             <br/>
             Ready for Electron/Boot integration
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TimerIcon className="w-6 h-6 text-indigo-600" />
            <h1 className="font-bold text-slate-900">{APP_NAME}</h1>
          </div>
          <div className="flex gap-2">
            {NAV_ITEMS.map(item => (
                <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id)}
                    className={`p-2 rounded-md ${activeTab === item.id ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500'}`}
                >
                    <item.icon className="w-5 h-5" />
                </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full gap-6">
            
            {/* Always show Timer on Tasks Tab */}
            {activeTab === 'tasks' && (
                <div className="flex flex-col h-full gap-6">
                    <div className="flex-shrink-0">
                         <TaskTimer 
                            activeTask={activeTask}
                            onStart={handleStartTask}
                            onPause={handlePauseTask}
                            onComplete={handleCompleteTask}
                            onAddMilestone={handleAddMilestone}
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