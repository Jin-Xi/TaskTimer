import React from 'react';
import { ListTodo, ChevronRight, ChevronUp, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface DrawerHandleProps {
  isOpen: boolean;
  onToggle: () => void;
  language: Language;
  position: 'right' | 'bottom'; // right: PC端, bottom: 移动端
}

export const DrawerHandle: React.FC<DrawerHandleProps> = ({
  isOpen,
  onToggle,
  language,
  position
}) => {
  const t = TRANSLATIONS[language];

  if (position === 'right') {
    // PC端：右侧边框中间，竖向排列
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center gap-2 px-2 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-l-xl shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:pr-4 group"
        title={isOpen ? t.taskExplorer : `展开${t.taskExplorer}`}
      >
        {isOpen ? (
          <>
            <X className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider writing-vertical hidden group-hover:block">
              {t.taskExplorer}
            </span>
          </>
        ) : (
          <>
            <ListTodo className="w-5 h-5" />
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    );
  }

  // 移动端：底部中间，横向排列
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 md:hidden flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-t-xl shadow-lg shadow-indigo-500/30 transition-all duration-300"
      title={isOpen ? t.taskExplorer : `展开${t.taskExplorer}`}
    >
      {isOpen ? (
        <>
          <X className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{t.taskExplorer}</span>
        </>
      ) : (
        <>
          <span className="text-xs font-bold uppercase tracking-wider">{t.taskExplorer}</span>
          <ChevronUp className="w-4 h-4" />
        </>
      )}
    </button>
  );
};
