
import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Info, Eye, EyeOff, ShieldCheck, Settings, X, Save, Database, Server } from 'lucide-react';
import { Task, TaskStatus, AIConfig, AIProvider } from '../types';
import { Button } from './Button';
import { generateProductivityAnalysis } from '../services/aiService';
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
  const [showSettings, setShowSettings] = useState(false);

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('chrono_ai_config');
    return saved ? JSON.parse(saved) : {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-3-flash-preview',
      baseUrl: ''
    };
  });

  const t = TRANSLATIONS[language];

  const handleSaveConfig = () => {
    localStorage.setItem('chrono_ai_config', JSON.stringify(aiConfig));
    setShowSettings(false);
  };

  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED || t.totalTime > 0);
  const dataPreview = completedTasks.map(t => ({
    title: t.title,
    tags: t.tags ? t.tags.join(', ') : 'None',
    durationMinutes: Math.round(t.totalTime / 1000 / 60)
  })).slice(0, 5);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use config if API Key is provided, otherwise falls back to service default
      const data = await generateProductivityAnalysis(tasks, aiConfig.apiKey ? aiConfig : undefined);
      setResult(data);
    } catch (err: any) {
      setError(err.message || (language === 'zh' ? "分析失败" : "Analysis failed"));
    } finally {
      setLoading(false);
    }
  };

  const providers: { id: AIProvider; label: string; desc: string; icon: any }[] = [
    { id: 'gemini', label: 'Google Gemini', desc: t.geminiDesc, icon: Sparkles },
    { id: 'deepseek', label: 'DeepSeek', desc: t.deepseekDesc, icon: Database },
    { id: 'openai', label: 'OpenAI', desc: 'GPT-4o, GPT-3.5-Turbo', icon: Server },
    { id: 'custom', label: 'Custom Endpoint', desc: 'Any OpenAI-compatible API', icon: Server },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 h-full overflow-y-auto pb-20 relative">
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 transition-all shadow-sm"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

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
                    </pre>
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
                <p className="opacity-80 mt-1 text-sm">Analyzed by {aiConfig.apiKey ? aiConfig.model : 'ChronoFlow Engine'}</p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                <div className="text-right">
                  <span className="text-[10px] opacity-80 uppercase font-bold tracking-widest block">Productivity Score</span>
                  <span className="text-4xl font-black">{result.productivityScore}</span>
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
                    <div key={i} className="flex items-start gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="min-w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-black">
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold">{t.aiSettings}</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {providers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const updates: Partial<AIConfig> = { provider: p.id };
                      if (p.id === 'deepseek') {
                        updates.model = 'deepseek-chat';
                        updates.baseUrl = 'https://api.deepseek.com/v1';
                      } else if (p.id === 'gemini') {
                        updates.model = 'gemini-3-flash-preview';
                        updates.baseUrl = '';
                      } else if (p.id === 'openai') {
                        updates.model = 'gpt-4o';
                        updates.baseUrl = 'https://api.openai.com/v1';
                      }
                      setAiConfig(prev => ({ ...prev, ...updates }));
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${aiConfig.provider === p.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 grayscale hover:grayscale-0'}`}
                  >
                    <p className="text-xs font-bold">{p.label}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.apiKey}</label>
                  <input 
                    type="password"
                    placeholder="sk-..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={aiConfig.apiKey}
                    onChange={(e) => setAiConfig({...aiConfig, apiKey: e.target.value})}
                  />
                  {!aiConfig.apiKey && <p className="text-[10px] text-slate-400 mt-1">{t.useDefault}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.modelName}</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig({...aiConfig, model: e.target.value})}
                  />
                </div>

                {(aiConfig.provider === 'custom' || aiConfig.provider === 'deepseek') && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{t.endpoint}</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                      value={aiConfig.baseUrl}
                      onChange={(e) => setAiConfig({...aiConfig, baseUrl: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowSettings(false)}>{t.cancel}</Button>
              <Button onClick={handleSaveConfig} className="gap-2">
                <Save className="w-4 h-4" />
                {t.saveConfig}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
