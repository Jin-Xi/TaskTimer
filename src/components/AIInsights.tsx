
import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Info, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Task, TaskStatus, AIConfig, Language } from '../types';
import { Button } from './Button';
import { generateProductivityAnalysis } from '../services/aiService';
import { TRANSLATIONS, AI_MODELS } from '../constants';

interface AIInsightsProps {
  language: Language;
  tasks: Task[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ language, tasks }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; suggestions: string[]; productivityScore: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDataPreview, setShowDataPreview] = useState(false);

  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
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
  });

  const t = TRANSLATIONS[language];

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateProductivityAnalysis(tasks, aiConfig, language);
      setResult(data);
    } catch (err: any) {
      setError(err.message || (language === 'zh-TW' ? "分析失敗" : "分析失败"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden items-center">

      {!result && !loading && !error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-terracotta-100 to-olive-100 dark:from-clay-900/30 dark:to-olive-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-inner">
            <Sparkles className="w-12 h-12 text-terracotta-600 dark:text-terracotta-400" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">{t.aiCoach}</h2>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium mb-16 max-w-xl mx-auto leading-relaxed">{t.aiCoachDesc}</p>

          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={tasks.length === 0}
            className="rounded-[2.5rem] px-20 py-7 text-xl md:text-2xl font-black shadow-2xl shadow-terracotta-500/20 active:scale-95 transition-all mb-20 bg-gradient-to-r from-terracotta-600 to-olive-600 hover:from-terracotta-500 hover:to-olive-500"
          >
            <BrainCircuit className="w-8 h-8 mr-4" />
            {t.analyzeWorkflow}
          </Button>

          <div className="w-full max-w-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800 p-8 shadow-sm">
             <button
               onClick={() => setShowDataPreview(!showDataPreview)}
               className="flex items-center justify-between w-full group"
             >
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-terracotta-500 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  {t.dataTransparency}
                </div>
                {showDataPreview ? <EyeOff className="w-5 h-5 text-slate-300" /> : <Eye className="w-5 h-5 text-slate-300" />}
             </button>
             {showDataPreview && (
               <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 text-left">{t.dataExplanation}</p>
                  <div className="bg-slate-950 p-6 rounded-3xl overflow-hidden shadow-inner">
                    <pre className="text-[11px] font-mono text-emerald-400/80 overflow-x-auto custom-scrollbar leading-relaxed">
                      {JSON.stringify(tasks.filter(t => t.totalTime > 0).slice(0,3).map(t => ({ title: t.title, mins: Math.round(t.totalTime/60000) })), null, 2)}
                    </pre>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-6">
          <div className="w-24 h-24 border-8 border-terracotta-100 dark:border-clay-900/30 border-t-terracotta-600 rounded-full animate-spin mb-12"></div>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white animate-pulse mb-4">{t.thinking}</h3>
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Processing with {aiConfig.model}</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
          <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-12 rounded-[3.5rem] border-2 border-rose-100 dark:border-rose-900/50 max-w-2xl shadow-xl">
            <Info className="w-12 h-12 mx-auto mb-8 opacity-60" />
            <p className="font-bold text-xl md:text-2xl leading-tight">{error}</p>
            <p className="text-sm mt-4 opacity-70">{language === 'zh-TW' ? '請在側邊欄配置 AI 設置' : '请在侧边栏配置 AI 设置'}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="w-full flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6 animate-in slide-in-from-bottom-8 duration-700 pb-20 flex flex-col items-center">
          <div className="w-full max-w-3xl md:max-w-4xl bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-xl dark:shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-br from-terracotta-600 to-olive-700 p-6 md:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 md:w-60 md:h-60 bg-white/5 rounded-full -mr-20 -mt-20 md:-mr-30 md:-mt-30 blur-3xl pointer-events-none" />
              <div className="relative z-10 text-center sm:text-left">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">{t.report}</h3>
                <p className="text-terracotta-100 text-xs mt-2 font-bold opacity-70 tracking-[0.15em] uppercase truncate">{aiConfig.model}</p>
              </div>
              <div className="relative z-10 flex flex-col items-center bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/20 shadow-xl min-w-[140px]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Efficiency Score</span>
                <span className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums">{result.productivityScore}</span>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              <section>
                <div className="flex items-center gap-3 mb-5">
                   <div className="w-2 h-2 rounded-full bg-terracotta-500 shadow-[0_0_12px_rgba(193,119,103,0.8)]" />
                   <h4 className="text-xs font-black text-terracotta-500 uppercase tracking-[0.3em]">{t.summary}</h4>
                </div>
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-terracotta-50 dark:bg-clay-900/30 rounded-full" />
                  <p className="text-base md:text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed italic opacity-95 break-words">"{result.summary}"</p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-5">
                   <div className="w-2 h-2 rounded-full bg-terracotta-500 shadow-[0_0_12px_rgba(193,119,103,0.8)]" />
                   <h4 className="text-xs font-black text-terracotta-500 uppercase tracking-[0.3em]">{t.improvements}</h4>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-4 md:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all group">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 text-terracotta-600 font-black flex items-center justify-center text-sm shadow-md group-hover:bg-terracotta-600 group-hover:text-white transition-all shrink-0 border border-slate-200 dark:border-slate-800">
                        {i + 1}
                      </div>
                      <span className="text-sm md:text-base text-slate-700 dark:text-slate-300 pt-1 font-medium leading-relaxed break-words">{s}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 border-t border-slate-200 dark:border-slate-800 flex justify-center">
              <button
                onClick={handleAnalyze}
                className="flex items-center gap-3 px-8 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-terracotta-600 hover:border-terracotta-500/30 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <div className="w-4 h-4 border-3 border-terracotta-200 border-t-terracotta-600 rounded-full animate-spin" />
                ) : (
                  <BrainCircuit className="w-4 h-4" />
                )}
                {t.regenerate}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
