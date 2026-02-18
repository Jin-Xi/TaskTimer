
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  /**
   * Color theme for the badge.
   * Matches common Tailwind color names.
   */
  color?: string;
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  color = 'slate', 
  className = '',
  onClick 
}) => {
  // Predefined style mapping for common colors to avoid dynamic class issues with Tailwind
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    slate: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    fuchsia: 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  };

  const selectedStyles = colorMap[color] || colorMap.slate;
  const cursorStyles = onClick ? 'cursor-pointer hover:brightness-95 active:scale-95' : '';

  return (
    <span 
      className={`
        inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border transition-all select-none
        ${selectedStyles} ${cursorStyles} ${className}
      `}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
