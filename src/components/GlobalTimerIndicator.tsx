import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface GlobalTimerIndicatorProps {
  activeTask: Task | null;
  onToggleTimer: () => void;
}

export const GlobalTimerIndicator: React.FC<GlobalTimerIndicatorProps> = ({
  activeTask,
  onToggleTimer
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Calculate elapsed time
  useEffect(() => {
    if (!activeTask || activeTask.status === TaskStatus.IDLE || activeTask.status === TaskStatus.COMPLETED) {
      setElapsed(activeTask?.totalTime || 0);
      return;
    }

    const lastLog = activeTask.logs[activeTask.logs.length - 1];
    if (!lastLog) {
      setElapsed(activeTask.totalTime);
      return;
    }

    const startTime = lastLog.start;
    const interval = setInterval(() => {
      setElapsed(activeTask.totalTime + (Date.now() - startTime));
    }, 100);

    return () => clearInterval(interval);
  }, [activeTask]);

  // Don't render if no active task
  if (!activeTask) return null;

  // Don't render if task is idle or completed
  if (activeTask.status === TaskStatus.IDLE || activeTask.status === TaskStatus.COMPLETED) return null;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    if (activeTask.status === TaskStatus.BREAK) return '☕';
    if (activeTask.status === TaskStatus.RUNNING) return '●';
    if (activeTask.status === TaskStatus.PAUSED) return '⏸';
    return '●';
  };

  const getStatusText = () => {
    if (activeTask.status === TaskStatus.BREAK) return '休息中';
    if (activeTask.status === TaskStatus.RUNNING) return '正在专注';
    if (activeTask.status === TaskStatus.PAUSED) return '已暂停';
    return '';
  };

  const getSpaceKeyHint = () => {
    if (activeTask.status === TaskStatus.BREAK) return '空格: 结束';
    if (activeTask.status === TaskStatus.RUNNING) return '空格: 暂停';
    if (activeTask.status === TaskStatus.PAUSED) return '空格: 继续';
    return '';
  };

  if (isMinimized) {
    return (
      <div className="shrink-0 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-700 z-[100] flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-green-500 text-sm">{getStatusIcon()}</span>
          <span className="font-mono text-lg font-bold text-neutral-900 dark:text-white">{formatTime(elapsed)}</span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          aria-label="展开"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="shrink-0 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-700 z-[100] flex items-center justify-between px-4 shadow-lg">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <span className="text-green-500 text-sm shrink-0">{getStatusIcon()}</span>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider shrink-0">
            {getStatusText()}
          </span>
          <span className="font-semibold text-neutral-900 dark:text-white truncate">
            {activeTask.title}
          </span>
        </div>
        <span className="font-mono text-lg font-bold text-neutral-900 dark:text-white shrink-0">
          {formatTime(elapsed)}
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-neutral-400 hidden sm:inline">
          {getSpaceKeyHint()}
        </span>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          aria-label="最小化"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
