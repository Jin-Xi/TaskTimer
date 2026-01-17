
import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, Info, Eye, EyeOff, ShieldCheck, Settings, X, Save, Database, Server, Cpu } from 'lucide-react';
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

  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('chrono_ai_config');
    return saved ? JSON.parse(saved) : {
      provider: 'custom',
      apiKey: 'sk-kxgaebbvdsnauqfvzbjqlivtapysmvsfpknbgrejcjsngxyu',
      model: 'deepseek-ai/DeepSeek-V3',
      baseUrl: 'https://api.siliconflow.cn/v1'
    };
  });

  const t = TRANSLATIONS[language];

  const handleSaveConfig = () => {
    localStorage.setItem('chrono_ai_config', JSON.stringify(aiConfig));
    setShowSettings(false);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateProductivityAnalysis(tasks, aiConfig, language);
      setResult(data);
    } catch (err: any) {
      setError(err.message || (language === 'zh' ? "分析失败" : "Analysis failed"));
    } finally {
      setLoading(false);
    }
  };

  const providers: { id: AIProvider; label: string; desc: string; icon: any }[] = [
    { id: 'custom', label: 'SiliconFlow', desc: '高性能推理平台', icon: Cpu },
    { id: 'gemini', label: 'Google Gemini', desc: t.geminiDesc, icon: Sparkles },
    { id: 'deepseek', label: 'DeepSeek Official', desc: t.deepseekDesc, icon: Database },
    { id: 'openai', label: 'OpenAI', desc: 'GPT-4o/3.5', icon: Server },
  ];

  return (
    <div className="relative w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden items-center">
      {/* Top Level Config Button */}
      <div className="absolute top-0 right-0 z-10 px-4">
        <button 
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-sm text-[10px] font-black uppercase tracking-widest"
        >
          <Settings className="w-3.5 h-3.5" />
          {t.aiSettings}
        </button>
      </div>

      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.25rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{t.aiCoach}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-sm mx-auto leading-relaxed">{t.aiCoachDesc}</p>

          <Button 
            size="lg" 
            onClick={handleAnalyze} 
            disabled={tasks.length === 0} 
            className="rounded-[2rem] px-14 py-5 text-lg font-black shadow-xl shadow-indigo-500/15 active:scale-95 transition-all mb-16"
          >
            <BrainCircuit className="w-6 h-6 mr-3" />
            {t.analyzeWorkflow}
          </Button>

          {/* Privacy Disclaimer Card */}
          <div className="w-full max-w-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
             <button 
               onClick={() => setShowDataPreview(!showDataPreview)}
               className="flex items-center justify-between w-full group"
             >
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {t.dataTransparency}
                </div>
                {showDataPreview ? <EyeOff className="w-4 h-4 text-slate-300" /> : <Eye className="w-4 h-4 text-slate-300" />}
             </button>
             {showDataPreview && (
               <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-4 text-left">{t.dataExplanation}</p>
                  <div className="bg-slate-950 p-4 rounded-2xl overflow-hidden shadow-inner">
                    <pre className="text-[9px] font-mono text-emerald-400/80 overflow-x-auto custom-scrollbar">
                      {JSON.stringify(tasks.filter(t => t.totalTime > 0).slice(0,3).map(t => ({ title: t.title, mins: Math.round(t.totalTime/60000) })), null, 2)}
                    </pre>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-20 h-20 border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 rounded-full animate-spin mb-10"></div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white animate-pulse mb-3">{t.thinking}</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Processing with {aiConfig.model}</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/50 max-w-lg shadow-xl">
            <Info className="w-10 h-10 mx-auto mb-6 opacity-50" />
            <p className="font-bold text-lg mb-6 leading-tight">{error}</p>
            <Button variant="secondary" size="md" onClick={() => setShowSettings(true)} className="rounded-2xl">{language === 'zh' ? '修正配置' : 'Fix Config'}</Button>
          </div>
        </div>
      )}

      {result && (
        <div className="w-full flex-1 overflow-y-auto custom-scrollbar p-4 space-y-10 animate-in slide-in-from-bottom-8 duration-700 pb-20 flex flex-col items-center">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Report Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              <div className="relative z-10 text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-black tracking-tight">{t.report}</h3>
                <p className="text-indigo-100 text-xs mt-3 font-bold opacity-70 tracking-[0.1em] uppercase">{aiConfig.model}</p>
              </div>
              <div className="relative z-10 flex flex-col items-center bg-white/10 backdrop-blur-2xl px-8 py-5 rounded-3xl border border-white/20 shadow-xl min-w-[160px]">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-80">Efficiency Score</span>
                <span className="text-5xl font-black tracking-tighter tabular-nums">{result.productivityScore}</span>
              </div>
            </div>
            
            {/* Report Body */}
            <div className="p-8 md:p-12 space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                   <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">{t.summary}</h4>
                </div>
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full" />
                  <p className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed italic opacity-95">“{result.summary}”</p>
                </div>
              </section>
              
              <section>
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                   <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">{t.improvements}</h4>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-5 bg-slate-50/50 dark:bg-slate-800/30 p-6 md:p-8 rounded-[2rem] border border-slate-100/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all group">
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 text-indigo-600 font-black flex items-center justify-center text-lg shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 border border-slate-100 dark:border-slate-800">
                        {i + 1}
                      </div>
                      <span className="text-base md:text-lg text-slate-700 dark:text-slate-300 pt-1 font-medium leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            {/* Footer Action */}
            <div className="bg-slate-50/50 dark:bg-slate-800/20 p-8 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <button 
                onClick={handleAnalyze} 
                className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                ) : (
                  <BrainCircuit className="w-4 h-4" />
                )}
                {t.regenerate}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="text-xl font-black tracking-tight uppercase">{t.aiSettings}</h3>
              <button onClick={() => setShowSettings(false)} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {providers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const up: any = { provider: p.id };
                      if (p.id === 'deepseek') { up.model = 'deepseek-chat'; up.baseUrl = 'https://api.deepseek.com/v1'; }
                      else if (p.id === 'gemini') { up.model = 'gemini-3-flash-preview'; up.baseUrl = ''; up.apiKey = ''; }
                      else if (p.id === 'openai') { up.model = 'gpt-4o'; up.baseUrl = 'https://api.openai.com/v1'; }
                      else if (p.id === 'custom') { up.model = 'deepseek-ai/DeepSeek-V3'; up.baseUrl = 'https://api.siliconflow.cn/v1'; }
                      setAiConfig(prev => ({ ...prev, ...up }));
                    }}
                    className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${aiConfig.provider === p.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-lg shadow-indigo-500/10' : 'border-slate-100 dark:border-slate-800 grayscale opacity-50 hover:opacity-100'}`}
                  >
                    <p.icon className="w-6 h-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest">{p.label}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                {/* Fix: Hide API key field for Gemini to comply with coding guidelines */}
                {aiConfig.provider !== 'gemini' && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] ml-2">{t.apiKey}</label>
                    <input type="password" placeholder="sk-..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-mono text-xs shadow-inner transition-all" value={aiConfig.apiKey} onChange={e => setAiConfig({...aiConfig, apiKey: e.target.value})} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] ml-2">{t.modelName}</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-mono text-xs shadow-inner transition-all" value={aiConfig.model} onChange={e => setAiConfig({...aiConfig, model: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] ml-2">{t.endpoint}</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-mono text-xs shadow-inner transition-all" value={aiConfig.baseUrl} onChange={e => setAiConfig({...aiConfig, baseUrl: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/20">
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="rounded-xl px-5">{t.cancel}</Button>
              <Button size="sm" onClick={handleSaveConfig} className="rounded-xl px-8 shadow-lg shadow-indigo-500/15">{t.saveConfig}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
