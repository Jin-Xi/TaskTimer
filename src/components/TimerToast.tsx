import React, { useEffect, useState } from 'react';

interface TimerToastProps {
  message: string;
  isVisible: boolean;
  duration?: number;
}

export const TimerToast: React.FC<TimerToastProps> = ({
  message,
  isVisible,
  duration = 1500
}) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldShow(true);
      const timeout = setTimeout(() => {
        setShouldShow(false);
      }, duration);
      return () => clearTimeout(timeout);
    } else {
      setShouldShow(false);
    }
  }, [isVisible, duration]);

  if (!shouldShow) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="px-6 py-3 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl shadow-xl flex items-center gap-3">
        <span className="text-sm font-bold">{message}</span>
      </div>
    </div>
  );
};
