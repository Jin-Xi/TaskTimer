
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@heroui/react';
import { Language } from '../types';
import { COLOR_HEX_MAP } from '../constants';

interface SplitActionButtonProps {
  onManualAdd: () => void;
  onAIGenerate: () => void;
  language: Language;
  projectColor?: string;
}

export const SplitActionButton: React.FC<SplitActionButtonProps> = ({
  onManualAdd,
  onAIGenerate,
  language,
  projectColor = 'green'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = COLOR_HEX_MAP[projectColor] || COLOR_HEX_MAP.green;

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAI = () => {
    onAIGenerate();
    setIsExpanded(false);
  };

  const handleManual = () => {
    onManualAdd();
    setIsExpanded(false);
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      {/* 主按钮 - 增大尺寸 */}
      <Button
        onClick={toggleExpanded}
        size="lg"
        className="rounded-2xl font-semibold text-white shadow-lg min-w-[120px]"
        style={{
          backgroundColor: colors.main,
          boxShadow: `0 4px 14px ${colors.main}40`
        }}
      >
        + {language === 'zh-TW' ? '添加工作流' : '添加工作流'}
      </Button>

      {/* 展开的选项按钮 - 显示在右方 */}
      {isExpanded && (
        <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
          <Button
            onClick={handleAI}
            size="lg"
            className="rounded-2xl font-semibold text-white shadow-lg"
            style={{
              backgroundColor: colors.main,
              boxShadow: `0 4px 14px ${colors.main}40`
            }}
          >
            ✨ {language === 'zh-TW' ? 'AI 生成' : 'AI 生成'}
          </Button>
          <Button
            onClick={handleManual}
            size="lg"
            className="rounded-2xl font-semibold"
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.light,
              color: colors.dark
            }}
          >
            ✏️ {language === 'zh-TW' ? '手工添加' : '手工添加'}
          </Button>
        </div>
      )}
    </div>
  );
};
