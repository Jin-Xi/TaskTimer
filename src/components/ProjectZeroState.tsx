
import React from 'react';
import { Button } from '@heroui/react';
import { GitBranch } from 'lucide-react';
import { Language } from '../types';
import { COLOR_HEX_MAP } from '../constants';

interface ProjectZeroStateProps {
  onManualAdd: () => void;
  onAIGenerate: () => void;
  language: Language;
  projectColor?: string;
}

export const ProjectZeroState: React.FC<ProjectZeroStateProps> = ({
  onManualAdd,
  onAIGenerate,
  language,
  projectColor = 'green'
}) => {
  const colors = COLOR_HEX_MAP[projectColor] || COLOR_HEX_MAP.green;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* 大图标 */}
      <div className="relative mb-8">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: colors.bg,
            opacity: 0.5
          }}
        >
          <GitBranch
            className="w-16 h-16"
            style={{
              color: colors.main,
              opacity: 0.4
            }}
          />
        </div>
        {/* 装饰性光晕 */}
        <div
          className="absolute inset-0 rounded-full blur-2xl -z-10"
          style={{
            backgroundColor: colors.main,
            opacity: 0.1
          }}
        />
      </div>

      {/* 提示文字 */}
      <div className="text-center mb-10">
        <p className="text-neutral-400 text-lg font-medium mb-2">
          {language === 'zh-TW' ? '暫無任務流' : '暂无任务流'}
        </p>
        <p className="text-neutral-300 text-sm">
          {language === 'zh-TW' ? '開始建立你的第一個工作流' : '开始建立你的第一个工作流'}
        </p>
      </div>

      {/* 按钮组 */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <Button
          onClick={onManualAdd}
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
        <Button
          onClick={onAIGenerate}
          size="lg"
          className="rounded-2xl font-semibold text-white shadow-lg"
          style={{
            backgroundColor: colors.main,
            boxShadow: `0 4px 14px ${colors.main}40`
          }}
        >
          ✨ {language === 'zh-TW' ? 'AI 生成' : 'AI 生成'}
        </Button>
      </div>
    </div>
  );
};
