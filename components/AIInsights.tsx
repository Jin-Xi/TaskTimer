
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
    <div className="relative w-full h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Top Level Config Button */}
      <div className="absolute top-0 right-0 z-10">
        <button 
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-sm text-[10px] font-black uppercase tracking-widest"
        >
          <Settings className="w-4 h-4" />
          {t.aiSettings}
        </button>
      </div>

      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.25rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{t.aiCoach}</h2>
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
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 border-8 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 rounded-full animate-spin mb-10"></div>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white animate-pulse mb-3">{t.thinking}</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Processing with {aiConfig.model}</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-10 rounded-[3rem] border border-rose-100 dark:border-rose-900/50 max-w-lg shadow-xl">
            <Info className="w-12 h-12 mx-auto mb-6 opacity-50" />
            <p className="font-bold text-xl mb-6 leading-tight">{error}</p>
            <Button variant="secondary" size="md" onClick={() => setShowSettings(true)} className="rounded-2xl">{language === 'zh' ? '修正配置' : 'Fix Config'}</Button>
          </div>
        </div>
      )}

      {result && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-10 animate-in slide-in-from-bottom-8 duration-700 pb-20">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-white flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="text-center md:text-left">
                <h3 className="text-4xl font-black tracking-tight">{t.report}</h3>
                <p className="text-indigo-100 text-sm mt-3 font-medium opacity-70 tracking-wide uppercase">{aiConfig.model}</p>
              </div>
              <div className="flex flex-col items-center bg-white/10 backdrop-blur-2xl px-10 py-6 rounded-[2.75rem] border border-white/20 shadow-2xl">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-80">Efficiency Score</span>
                <span className="text-6xl font-black tracking-tighter tabular-nums">{result.productivityScore}</span>
              </div>
            </div>
            
            <div className="p-12 space-y-16">
              <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                   <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em]">{t.summary}</h4>
                </div>
                <p className="text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed italic opacity-90">“{result.summary}”</p>
              </section>
              
              <section>
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                   <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em]">{t.improvements}</h4>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-6 bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all group shadow-sm">
                      <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-900 text-indigo-600 font-black flex items-center justify-center text-xl shadow-md group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-lg text-slate-700 dark:text-slate-300 pt-1.5 font-medium leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            <div className="bg-slate-50/50 dark:bg-slate-800/20 p-10 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <Button variant="ghost" onClick={handleAnalyze} isLoading={loading} className="rounded-2xl px-8">
                <BrainCircuit className="w-4 h-4 mr-3" />
                {t.regenerate}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
              <h3 className="text-2xl font-black tracking-tight uppercase">{t.aiSettings}</h3>
              <button onClick={() => setShowSettings(false)} className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-10 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                {providers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const up: any = { provider: p.id };
                      if (p.id === 'deepseek') { up.model = 'deepseek-chat'; up.baseUrl = 'https://api.deepseek.com/v1'; }
                      else if (p.id === 'gemini') { up.model = 'gemini-3-flash-preview'; up.baseUrl = ''; }
                      else if (p.id === 'openai') { up.model = 'gpt-4o'; up.baseUrl = 'https://api.openai.com/v1'; }
                      else if (p.id === 'custom') { up.model = 'deepseek-ai/DeepSeek-V3'; up.baseUrl = 'https://api.siliconflow.cn/v1'; }
                      setAiConfig(prev => ({ ...prev, ...up }));
                    }}
                    className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border-2 transition-all ${aiConfig.provider === p.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-lg shadow-indigo-500/10' : 'border-slate-100 dark:border-slate-800 grayscale opacity-50 hover:opacity-100'}`}
                  >
                    <p.icon className="w-7 h-7" />
                    <p className="text-[11px] font-black uppercase tracking-widest">{p.label}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-5 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t.apiKey}</label>
                  <input type="password" placeholder="sk-..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-indigo-500/10 font-mono text-sm shadow-inner transition-all" value={aiConfig.apiKey} onChange={e => setAiConfig({...aiConfig, apiKey: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t.modelName}</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-indigo-500/10 font-mono text-sm shadow-inner transition-all" value={aiConfig.model} onChange={e => setAiConfig({...aiConfig, model: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{t.endpoint}</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-indigo-500/10 font-mono text-sm shadow-inner transition-all" value={aiConfig.baseUrl} onChange={e => setAiConfig({...aiConfig, baseUrl: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 bg-slate-50/50 dark:bg-slate-800/20">
              <Button variant="ghost" onClick={() => setShowSettings(false)} className="rounded-2xl px-6">{t.cancel}</Button>
              <Button onClick={handleSaveConfig} className="rounded-2xl px-10 shadow-xl shadow-indigo-500/15">{t.saveConfig}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
