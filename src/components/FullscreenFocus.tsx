
import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, X, Image as ImageIcon, Calendar, Clock } from 'lucide-react';
import { Button, Chip } from '@heroui/react';
import { Task, TaskStatus, Language } from '../types';

interface FullscreenFocusProps {
  language: Language;
  activeTask: Task | null;
  onToggleStatus: (taskId: string) => void;
  onExit: () => void;
  backgroundImage: string | null;
  onSetBackgroundImage: (url: string) => void;
}

export const FullscreenFocus: React.FC<FullscreenFocusProps> = ({ 
  language,
  activeTask, 
  onToggleStatus, 
  onExit, 
  backgroundImage, 
  onSetBackgroundImage 
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Task timer interval
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

    // Real-world clock interval
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
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

  const formattedDate = currentTime.toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const formattedClock = currentTime.toLocaleTimeString(language === 'zh-TW' ? 'zh-TW' : 'zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  if (!activeTask) return null;

  // Default background image
  const defaultBackground = 'https://maas-log-prod.cn-wlcb.ufileos.com/anthropic/4208719f-c914-4c8b-afeb-e28943ecbf24/3385c9091a480268cc83801560f5aae5.jpg?UCloudPublicKey=TOKEN_e15ba47a-d098-4fbd-9afc-a0dcf0e4e621&Expires=1773577487&Signature=DG31DLYvXyC37qOawKHeBoh4psc=';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-white overflow-hidden bg-neutral-900">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${backgroundImage || defaultBackground})`,
          filter: 'blur(0px)'
        }}
      />

      <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-[2px]" />

      {/* Top Left: Current Date & Time */}
      <div className="absolute top-8 left-8 z-30 flex flex-col items-start gap-1 animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-2xl border-0 shadow-xl text-neutral-900">
          <Calendar className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold tracking-wide">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-2xl border-0 shadow-xl text-neutral-900 ml-2">
          <Clock className="w-4 h-4 text-green-600" />
          <span className="text-xl font-mono font-bold tracking-widest">{formattedClock}</span>
        </div>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-4xl px-6 text-center">
        
        <div className="mb-8 animate-in slide-in-from-top-10 duration-700">
           <div className="flex justify-center gap-2 mb-4">
             {(activeTask.tags || []).map(tag => (
               <Chip
                 key={tag}
                 color="default"
                 variant="solid"
                 className="bg-white/90 hover:bg-white border-0 shadow-md"
               >
                  {tag}
               </Chip>
             ))}
           </div>
           <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg leading-tight">
             {activeTask.title}
           </h1>
        </div>

        <div className="mb-12 font-mono text-7xl md:text-9xl font-bold tracking-tighter tabular-nums drop-shadow-2xl animate-in zoom-in-90 duration-500">
          {formatTime(elapsed)}
        </div>

        <div className="flex items-center gap-6 animate-in slide-in slide-in-from-bottom-10 duration-700">
           <Button
             isIconOnly
             size="lg"
             color="success"
             variant="solid"
             className="w-20 h-20 rounded-full shadow-lg hover:shadow-xl min-w-unit-20 h-unit-20 bg-green-500 hover:bg-green-600 text-white"
             onPress={() => onToggleStatus(activeTask.id)}
           >
              {activeTask.status === TaskStatus.RUNNING ? (
                 <Pause className="w-8 h-8" />
              ) : (
                 <Play className="w-8 h-8 ml-1" />
              )}
           </Button>

           <Button
             isIconOnly
             size="lg"
             color="default"
             variant="solid"
             className="w-16 h-16 rounded-full bg-white/90 hover:bg-white min-w-unit-16 h-unit-16 shadow-lg"
             onPress={onExit}
           >
              <X className="w-6 h-6 text-neutral-900" />
           </Button>
        </div>

      </div>

      <div className="absolute bottom-6 right-6 z-20">
         <Button
           isIconOnly
           size="sm"
           color="default"
           variant="solid"
           className="p-3 rounded-full bg-white/90 hover:bg-white shadow-lg"
           onPress={() => fileInputRef.current?.click()}
         >
            <ImageIcon className="w-5 h-5 text-neutral-900" />
         </Button>
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
