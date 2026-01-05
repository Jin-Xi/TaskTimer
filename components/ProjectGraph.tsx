
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Task, TaskStatus } from '../types';
import { Lock, CheckCircle2, Play, Circle } from 'lucide-react';

interface ProjectGraphProps {
  tasks: Task[];
  color: string;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  level: number;
}

export const ProjectGraph: React.FC<ProjectGraphProps> = ({ tasks, color }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Calculate levels (depth in dependency tree)
  const taskLevels = useMemo(() => {
    const levels: Record<string, number> = {};
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    const getLevel = (id: string): number => {
      if (levels[id] !== undefined) return levels[id];
      const task = taskMap.get(id);
      if (!task || !task.parentTaskId) {
        levels[id] = 0;
        return 0;
      }
      const level = getLevel(task.parentTaskId) + 1;
      levels[id] = level;
      return level;
    };

    tasks.forEach(t => getLevel(t.id));
    return levels;
  }, [tasks]);

  const maxLevel = Math.max(0, ...Object.values(taskLevels));
  
  // Group tasks by level
  const levelsGroups = useMemo(() => {
    const groups: Record<number, Task[]> = {};
    tasks.forEach(task => {
      const level = taskLevels[task.id];
      if (!groups[level]) groups[level] = [];
      groups[level].push(task);
    });
    return groups;
  }, [tasks, taskLevels]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const nodePositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {};
    const levelWidth = dimensions.width / (maxLevel + 1 || 1);
    
    Object.entries(levelsGroups).forEach(([levelStr, group]) => {
      const level = parseInt(levelStr);
      const levelX = levelWidth * level + levelWidth / 2;
      const verticalGap = dimensions.height / (group.length + 1);
      
      group.forEach((task, idx) => {
        positions[task.id] = {
          id: task.id,
          x: levelX,
          y: verticalGap * (idx + 1),
          level
        };
      });
    });
    return positions;
  }, [levelsGroups, dimensions, maxLevel]);

  const connections = useMemo(() => {
    return tasks
      .filter(t => t.parentTaskId && nodePositions[t.id] && nodePositions[t.parentTaskId])
      .map(t => ({
        id: `${t.parentTaskId}-${t.id}`,
        from: nodePositions[t.parentTaskId!],
        to: nodePositions[t.id]
      }));
  }, [tasks, nodePositions]);

  if (tasks.length === 0) return null;

  return (
    <div ref={containerRef} className="relative w-full h-80 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
      {/* SVG for connections */}
      <svg className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        <defs>
          <marker id={`arrow-${color}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="currentColor" className={`text-${color}-400 opacity-50`} />
          </marker>
        </defs>
        {connections.map(conn => {
          const dx = conn.to.x - conn.from.x;
          const controlX = conn.from.x + dx / 2;
          const path = `M ${conn.from.x} ${conn.from.y} C ${controlX} ${conn.from.y}, ${controlX} ${conn.to.y}, ${conn.to.x} ${conn.to.y}`;
          
          return (
            <g key={conn.id}>
              <path
                d={path}
                fill="none"
                strokeWidth="2"
                markerEnd={`url(#arrow-${color})`}
                className={`stroke-${color}-200 dark:stroke-${color}-800 transition-all duration-500`}
              />
              <path
                d={path}
                fill="none"
                strokeWidth="2"
                className={`stroke-${color}-500/30 dark:stroke-${color}-400/20 animate-pulse`}
                style={{ strokeDasharray: '4,4' }}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {Object.values(nodePositions).map(pos => {
        const task = tasks.find(t => t.id === pos.id)!;
        const isLocked = task.parentTaskId ? (tasks.find(pt => pt.id === task.parentTaskId)?.status !== TaskStatus.COMPLETED) : false;
        const isCompleted = task.status === TaskStatus.COMPLETED;
        const isRunning = task.status === TaskStatus.RUNNING;

        return (
          <div
            key={task.id}
            style={{ left: pos.x, top: pos.y }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-500 group`}
          >
            <div className={`
              w-36 p-2 rounded-lg border-2 shadow-sm transition-all
              ${isCompleted 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300' 
                : isRunning
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 animate-pulse'
                  : isLocked
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 opacity-70 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
              }
            `}>
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="flex-shrink-0">
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : 
                   isRunning ? <Play className="w-4 h-4" /> :
                   isLocked ? <Lock className="w-4 h-4" /> :
                   <Circle className="w-4 h-4" />}
                </div>
                <div className="text-[10px] font-bold truncate leading-tight flex-1">
                  {task.title}
                </div>
              </div>
              <div className="mt-1 text-[8px] opacity-60 font-mono text-right">
                {Math.floor(task.totalTime / 60000)}m
              </div>
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-20 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl pointer-events-none">
                {task.description || "No description"}
                {isLocked && <div className="text-amber-400 mt-1">Waiting for parent task...</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
