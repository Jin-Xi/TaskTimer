
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
      <div className="absolute top-0 right-0 z-10 px-6">
        <button 
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-2 border-slate-100 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-sm text-xs font-black uppercase tracking-[0.2em]"
        >
          <Settings className="w-4.5 h-4.5" />
          {t.aiSettings}
        </button>
      </div>

      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-12 shadow-inner">
            <Sparkles className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6">{t.aiCoach}</h2>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium mb-16 max-w-xl mx-auto leading-relaxed">{t.aiCoachDesc}</p>

          <Button 
            size="lg" 
            onClick={handleAnalyze} 
            disabled={tasks.length === 0} 
            className="rounded-[2.5rem] px-20 py-7 text-xl md:text-2xl font-black shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all mb-20"
          >
            <BrainCircuit className="w-8 h-8 mr-4" />
            {t.analyzeWorkflow}
          </Button>

          <div className="w-full max-w-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 p-8 shadow-sm">
             <button 
               onClick={() => setShowDataPreview(!showDataPreview)}
               className="flex items-center justify-between w-full group"
             >
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-500 transition-colors">
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
          <div className="w-24 h-24 border-8 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 rounded-full animate-spin mb-12"></div>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white animate-pulse mb-4">{t.thinking}</h3>
          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Processing with {aiConfig.model}</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-12 rounded-[3.5rem] border-2 border-rose-100 dark:border-rose-900/50 max-w-2xl shadow-xl">
            <Info className="w-12 h-12 mx-auto mb-8 opacity-60" />
            <p className="font-bold text-xl md:text-2xl mb-10 leading-tight">{error}</p>
            <Button variant="secondary" size="lg" onClick={() => setShowSettings(true)} className="rounded-[2rem] px-12 text-lg">
               {language === 'zh' ? '修正配置' : 'Fix Config'}
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="w-full flex-1 overflow-y-auto custom-scrollbar p-6 space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-32 flex flex-col items-center">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[3.5rem] md:rounded-[4.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)] border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-12 md:p-16 text-white flex flex-col md:flex-row justify-between items-center gap-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
              <div className="relative z-10 text-center md:text-left">
                <h3 className="text-4xl md:text-6xl font-black tracking-tight">{t.report}</h3>
                <p className="text-indigo-100 text-sm mt-5 font-bold opacity-70 tracking-[0.2em] uppercase">{aiConfig.model}</p>
              </div>
              <div className="relative z-10 flex flex-col items-center bg-white/10 backdrop-blur-2xl px-10 py-7 rounded-[2.5rem] border-2 border-white/20 shadow-2xl min-w-[200px]">
                <span className="text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-80">Efficiency Score</span>
                <span className="text-6xl md:text-7xl font-black tracking-tighter tabular-nums">{result.productivityScore}</span>
              </div>
            </div>
            
            <div className="p-12 md:p-16 space-y-16">
              <section>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                   <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em]">{t.summary}</h4>
                </div>
                <div className="relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full" />
                  <p className="text-2xl md:text-4xl font-medium text-slate-800 dark:text-slate-100 leading-[1.6] italic opacity-95">“{result.summary}”</p>
                </div>
              </section>
              
              <section>
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                   <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em]">{t.improvements}</h4>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-8 bg-slate-50/50 dark:bg-slate-800/30 p-8 md:p-10 rounded-[2.5rem] border-2 border-slate-100/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 text-indigo-600 font-black flex items-center justify-center text-xl shadow-md group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 border-2 border-slate-100 dark:border-slate-800">
                        {i + 1}
                      </div>
                      <span className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 pt-1.5 font-medium leading-[1.6]">{s}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            <div className="bg-slate-50/50 dark:bg-slate-800/20 p-12 border-t-2 border-slate-100 dark:border-slate-800 flex justify-center">
              <button 
                onClick={handleAnalyze} 
                className="flex items-center gap-5 px-12 py-5 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all font-black text-xs md:text-sm uppercase tracking-[0.25em] shadow-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                ) : (
                  <BrainCircuit className="w-5 h-5" />
                )}
                {t.regenerate}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal updated */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl border-2 border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="px-10 py-8 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="text-2xl font-black tracking-tight uppercase">{t.aiSettings}</h3>
              <button onClick={() => setShowSettings(false)} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
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
                    className={`flex flex-col items-center gap-5 p-6 rounded-[2.5rem] border-2 transition-all ${aiConfig.provider === p.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-2xl shadow-indigo-500/15' : 'border-slate-100 dark:border-slate-800 grayscale opacity-50 hover:opacity-100'}`}
                  >
                    <p.icon className="w-8 h-8" />
                    <p className="text-xs font-black uppercase tracking-widest">{p.label}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-6 pt-4">
                {aiConfig.provider !== 'gemini' && (
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-3">{t.apiKey}</label>
                    <input type="password" placeholder="sk-..." className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 outline-none focus:ring-8 focus:ring-indigo-500/5 font-mono text-sm shadow-inner transition-all" value={aiConfig.apiKey} onChange={e => setAiConfig({...aiConfig, apiKey: e.target.value})} />
                  </div>
                )}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-3">{t.modelName}</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 outline-none focus:ring-8 focus:ring-indigo-500/5 font-mono text-sm shadow-inner transition-all" value={aiConfig.model} onChange={e => setAiConfig({...aiConfig, model: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-3">{t.endpoint}</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 outline-none focus:ring-8 focus:ring-indigo-500/5 font-mono text-sm shadow-inner transition-all" value={aiConfig.baseUrl} onChange={e => setAiConfig({...aiConfig, baseUrl: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="p-10 border-t-2 border-slate-100 dark:border-slate-800 flex justify-end gap-5 bg-slate-50/50 dark:bg-slate-800/20">
              <Button variant="ghost" size="md" onClick={() => setShowSettings(false)} className="rounded-2xl px-8 text-base">{t.cancel}</Button>
              <Button size="md" onClick={handleSaveConfig} className="rounded-2xl px-12 text-base shadow-xl shadow-indigo-500/20 font-black">{t.saveConfig}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
