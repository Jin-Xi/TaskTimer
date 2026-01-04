import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Info, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { Button } from './Button';
import { generateProductivityAnalysis } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface AIInsightsProps {
  language: 'en' | 'zh';
  tasks: Task[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ language, tasks }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; suggestions: string[]; productivityScore: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDataPreview, setShowDataPreview] = useState(false);

  const t = TRANSLATIONS[language];

  // Prepare a preview of the data to be sent
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED || t.totalTime > 0);
  const dataPreview = completedTasks.map(t => ({
    title: t.title,
    tags: t.tags ? t.tags.join(', ') : 'None',
    durationMinutes: Math.round(t.totalTime / 1000 / 60)
  })).slice(0, 5); // Show first 5 for preview

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateProductivityAnalysis(tasks);
      setResult(data);
    } catch (err) {
      setError(language === 'zh' ? "分析失败。请确保系统环境变量中配置了有效的 API Key。" : "Failed to generate insights. Ensure API Key is configured in environment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 h-full overflow-y-auto pb-20">
      <div className="text-center mb-10">
        <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.aiCoach}</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">{t.aiCoachDesc}</p>
      </div>

      {!result && !loading && (
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <Button size="lg" onClick={handleAnalyze} disabled={tasks.length === 0} className="shadow-xl shadow-indigo-500/20 px-10 py-4 text-lg">
              <BrainCircuit className="w-6 h-6 mr-3" />
              {t.analyzeWorkflow}
            </Button>
            {tasks.length === 0 && <p className="text-xs text-red-500 mt-2">{t.completeTasksFirst}</p>}
          </div>

          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
             <button 
               onClick={() => setShowDataPreview(!showDataPreview)}
               className="flex items-center justify-between w-full text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
             >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {t.dataTransparency}
                </div>
                {showDataPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             </button>
             
             {showDataPreview && (
               <div className="mt-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-xs text-slate-500 leading-relaxed">{t.dataExplanation}</p>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <pre className="text-[10px] font-mono text-slate-600 dark:text-slate-400 overflow-x-auto">
                      {JSON.stringify(dataPreview, null, 2)}
                      {completedTasks.length > 5 && "\n  ... and more tasks"}
                    </pre>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-indigo-500 font-bold uppercase tracking-wider">
                    <Info className="w-3 h-3" />
                    {t.apiKeyRequired}
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
          <p className="text-slate-600 dark:text-slate-400 font-bold text-xl animate-pulse">{t.geminiThinking}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-xl text-center mb-6 border border-red-200 dark:border-red-800 max-w-lg mx-auto">
          <Info className="w-8 h-8 mx-auto mb-3" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-700">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-2xl font-bold">{t.report}</h3>
                <p className="opacity-80 mt-1 text-sm">Generated by Gemini-3-Flash</p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                <div className="text-right">
                  <span className="text-[10px] opacity-80 uppercase font-bold tracking-widest block">Productivity Score</span>
                  <span className="text-4xl font-black">{result.productivityScore}</span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center">
                   <div className="w-8 h-8 rounded-full bg-white shadow-lg" style={{ clipPath: `inset(${100 - result.productivityScore}% 0 0 0)` }}></div>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  {t.summary}
                </h4>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-xl font-medium">{result.summary}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                   {t.improvements}
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 transition-colors group">
                      <div className="min-w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 pt-1 leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-800 text-center">
              <Button variant="secondary" onClick={handleAnalyze} isLoading={loading}>
                <BrainCircuit className="w-4 h-4 mr-2" />
                {t.regenerate}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};