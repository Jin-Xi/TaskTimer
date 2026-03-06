
import React, { useState } from 'react';
import { Sparkles, ArrowRight, BrainCircuit, Wand2 } from 'lucide-react';
import { Button } from '@heroui/react';
import { TRANSLATIONS, AI_MODELS } from '../constants';
import { Language, AIConfig } from '../types';
import { generateProjectPlan } from '../services/aiService';

interface AIProjectGeneratorProps {
  language: Language;
  onPlanGenerated: (projectData: any, tasksData: any[]) => void;
}

export const AIProjectGenerator: React.FC<AIProjectGeneratorProps> = ({ language, onPlanGenerated }) => {
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  // Helper to load config safely
  const getAiConfig = (): AIConfig => {
    const saved = localStorage.getItem('chrono_ai_config');
    if (saved) return JSON.parse(saved);
    // Use default from AI_MODELS
    const firstGroup = AI_MODELS.gemini?.[0];
    return {
      provider: 'gemini',
      apiKey: '',
      model: firstGroup?.defaultModel || 'gemini-2.5-pro-exp-03-25',
      baseUrl: ''
    };
  };

  const handleGenerate = async () => {
    if (!goal.trim()) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep(0);

    // Simulate loading steps for better UX
    const stepsInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      const config = getAiConfig();
      // Force Gemini provider for this feature if not set, as it relies on complex schema
      if (config.provider !== 'gemini') {
         // Optionally warn user or fallback, but for now we proceed assuming user might have a capable custom model
      }

      const plan = await generateProjectPlan(goal, context, config, language);

      if (!plan || !plan.tasks) {
        throw new Error("Invalid response from AI service.");
      }

      clearInterval(stepsInterval);
      onPlanGenerated(
        {
          name: plan.projectName,
          description: plan.description,
          color: plan.color?.toLowerCase() || 'indigo',
        },
        plan.tasks
      );
    } catch (err: any) {
      clearInterval(stepsInterval);
      console.error(err);

      // Handle different error scenarios
      let errorMessage = err.message || "Failed to generate plan. Please check your AI settings.";

      if (errorMessage.includes('API key') || errorMessage.includes('VITE_API_KEY')) {
        errorMessage = language === 'zh-TW'
          ? "未配置 AI API 密钥。請在 .env 文件中設置 VITE_API_KEY。"
          : "未配置 AI API 密钥。请在 .env 文件中设置 VITE_API_KEY。";
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = language === 'zh-TW'
          ? "網絡連接失敗，請檢查您的網絡設置。"
          : "网络连接失败，请检查您的网络设置。";
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        errorMessage = language === 'zh-TW'
          ? "API 調用次數超限，請稍後再試。"
          : "API 调用次数超限，请稍后再试。";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadingTexts = [
    t.generating, // "Decomposing goal..."
    language === 'zh-TW' ? "正在構建依賴關係..." : "正在构建依赖关系...",
    language === 'zh-TW' ? "估算任務耗時..." : "估算任务耗时...",
    language === 'zh-TW' ? "優化執行路徑..." : "优化执行路径..."
  ];

  return (
    <div className="flex-1 min-h-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 lg:p-12 relative animate-in fade-in duration-500">
      {/* Background Ambience - responsive sizes */}
      <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-slate-river-500/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] bg-slate-river-400/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none" />

      <div className="w-full max-w-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] shadow-2xl shadow-slate-river/10 border border-neutral-100 dark:border-neutral-800 p-6 sm:p-8 md:p-12 lg:p-16 relative z-10 my-4">

        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-[1.5rem] sm:rounded-[1.75rem] md:rounded-[2rem] bg-gradient-to-br from-slate-river-400 to-slate-river-500 mb-4 md:mb-8 shadow-xl shadow-slate-river/30">
            <BrainCircuit className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mb-3 md:mb-4">{t.aiPlannerTitle}</h2>
          <p className="text-sm sm:text-base md:text-lg text-neutral-500 dark:text-neutral-400 font-medium max-w-xl mx-auto px-2">{t.aiPlannerDesc}</p>
        </div>

        <div className="space-y-5 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <label className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-neutral-400 ml-1 sm:ml-2">{t.goalInputLabel}</label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder={t.goalInputPlaceholder}
              className="w-full bg-neutral-50 dark:bg-neutral-950/50 border-2 border-neutral-100 dark:border-neutral-800 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-base sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 outline-none focus:border-slate-river-500 focus:ring-4 sm:focus:ring-6 md:focus:ring-8 focus:ring-slate-river-500/10 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2 md:space-y-3">
            <label className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-neutral-400 ml-1 sm:ml-2">{t.contextInputLabel}</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder={t.contextInputPlaceholder}
              className="w-full h-24 sm:h-28 md:h-32 bg-neutral-50 dark:bg-neutral-950/50 border-2 border-neutral-100 dark:border-neutral-800 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 text-sm sm:text-base md:text-base font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 outline-none focus:border-slate-river-500 focus:ring-4 sm:focus:ring-6 md:focus:ring-8 focus:ring-slate-river-500/10 transition-all shadow-inner resize-none leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 text-xs sm:text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="pt-2 md:pt-4">
            <Button
              size="lg"
              onClick={handleGenerate}
              isDisabled={isLoading || !goal.trim()}
              isLoading={isLoading}
              className={`w-full py-4 sm:py-5 md:py-6 rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] text-base sm:text-lg md:text-xl font-black shadow-xl transition-all duration-500 ${!isLoading ? 'bg-slate-river-500 hover:bg-slate-river-400 shadow-slate-river/30 hover:scale-[1.01] sm:hover:scale-[1.02] hover:-translate-y-0.5 sm:hover:-translate-y-1' : ''}`}
            >
              {!isLoading && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>{t.generatePlan}</span>
                </div>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
