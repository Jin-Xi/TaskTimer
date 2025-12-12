import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, X, Image as ImageIcon, Upload } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { Button } from './Button';

interface FullscreenFocusProps {
  activeTask: Task | null;
  onToggleStatus: (taskId: string) => void;
  onExit: () => void;
  backgroundImage: string | null;
  onSetBackgroundImage: (url: string) => void;
}

export const FullscreenFocus: React.FC<FullscreenFocusProps> = ({ 
  activeTask, 
  onToggleStatus, 
  onExit, 
  backgroundImage, 
  onSetBackgroundImage 
}) => {
  const [elapsed, setElapsed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;

    if (activeTask && activeTask.status === TaskStatus.RUNNING) {
      const currentLog = activeTask.logs[activeTask.logs.length - 1];
      const startTime = currentLog ? currentLog.start : Date.now();
      
      setElapsed(activeTask.totalTime + (Date.now() - startTime));

      interval = setInterval(() => {
        setElapsed(activeTask.totalTime + (Date.now() - startTime));
      }, 1000);
    } else if (activeTask) {
      setElapsed(activeTask.totalTime);
    } else {
      setElapsed(0);
    }

    return () => clearInterval(interval);
  }, [activeTask]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSetBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!activeTask) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white overflow-hidden bg-slate-900">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
        style={{ 
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          filter: backgroundImage ? 'blur(0px)' : 'none'
        }}
      >
        {!backgroundImage && (
           <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
        )}
      </div>

      <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm" />

      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-4xl px-6 text-center">
        
        <div className="mb-8 animate-in slide-in-from-top-10 duration-700">
           <div className="flex justify-center gap-2 mb-4">
             {(activeTask.tags || []).map(tag => (
               <span key={tag} className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
                  {tag}
               </span>
             ))}
           </div>
           <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg leading-tight">
             {activeTask.title}
           </h1>
        </div>

        <div className="mb-12 font-mono text-7xl md:text-9xl font-bold tracking-tighter tabular-nums drop-shadow-2xl animate-in zoom-in-90 duration-500">
          {formatTime(elapsed)}
        </div>

        <div className="flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-700">
           <button 
             onClick={() => onToggleStatus(activeTask.id)}
             className="group flex items-center justify-center w-20 h-20 rounded-full bg-white text-indigo-600 hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
             title={activeTask.status === TaskStatus.RUNNING ? "Pause" : "Resume"}
           >
              {activeTask.status === TaskStatus.RUNNING ? (
                 <Pause className="w-8 h-8 fill-current" />
              ) : (
                 <Play className="w-8 h-8 fill-current ml-1" />
              )}
           </button>

           <button 
             onClick={onExit}
             className="group flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95"
             title="Exit Fullscreen"
           >
              <X className="w-6 h-6" />
           </button>
        </div>

      </div>

      <div className="absolute bottom-6 right-6 z-20">
         <button 
           onClick={() => fileInputRef.current?.click()}
           className="p-3 rounded-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white backdrop-blur-md transition-all"
           title="Change Background Image"
         >
            <ImageIcon className="w-5 h-5" />
         </button>
         <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
         />
      </div>
    </div>
  );
};