
import React, { useState, useEffect } from 'react';
import { X, Key, Globe, Server, CheckCircle2, ChevronDown } from 'lucide-react';
import { TRANSLATIONS, AI_MODELS } from '../constants';
import { Language, AIConfig, AIProvider } from '../types';
import { Button } from '@heroui/react';

interface AISettingsModalProps {
  language: Language;
  onClose: () => void;
}

const PROVIDER_OPTIONS: { value: AIProvider; label: string; desc: string }[] = [
  { value: 'gemini', label: 'Google Gemini', desc: 'geminiDesc' },
  { value: 'deepseek', label: 'DeepSeek', desc: 'deepseekDesc' },
  { value: 'openai', label: 'OpenAI', desc: 'OpenAI / 兼容服务' },
  { value: 'custom', label: '自定义', desc: '自定义端点' },
];

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ language, onClose }) => {
  const t = TRANSLATIONS[language];
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<AIConfig>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.0-flash-exp',
    baseUrl: ''
  });

  // Load saved config on mount
  useEffect(() => {
    const saved = localStorage.getItem('chrono_ai_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('chrono_ai_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleProviderChange = (provider: AIProvider) => {
    const defaultModel = AI_MODELS[provider]?.[0]?.defaultModel || '';
    setConfig(prev => ({
      ...prev,
      provider,
      model: defaultModel
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-neutral-100 dark:border-neutral-800 relative overflow-hidden animate-in zoom-in-95 duration-500">

        {/* Background Decor - 使用 AI 专用色 */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-slate-river-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-slate-river-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-8 md:p-10 relative z-10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-400 transition-all"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] sm:rounded-[1.5rem] bg-gradient-to-br from-slate-river-400 to-slate-river-500 mb-3 sm:mb-4 shadow-lg shadow-slate-river/30">
              <Key className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-1 sm:mb-2 tracking-tight">
              {t.aiSettings}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm sm:text-base font-medium">
              {language === 'zh-TW' ? '配置您的 AI 服務提供商' : '配置您的 AI 服务提供商'}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
                {t.provider}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleProviderChange(option.value)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      config.provider === option.value
                        ? 'bg-slate-river-500 text-white shadow-lg shadow-slate-river/25'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <div className="text-sm font-bold">{option.label}</div>
                    <div className={`text-xs mt-0.5 ${config.provider === option.value ? 'text-slate-river-100' : 'text-neutral-400'}`}>
                      {(t as any)[option.desc] || option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
                {t.apiKey}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder={language === 'zh-TW' ? '輸入您的 API 密鑰' : '输入您的 API 密钥'}
                  className="w-full bg-neutral-50 dark:bg-neutral-950/50 border-2 border-neutral-100 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 outline-none focus:border-slate-river-500 focus:ring-4 focus:ring-slate-river-500/10 transition-all"
                />
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
              </div>
            </div>

            {/* Model Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
                {t.modelName}
              </label>
              <div className="relative">
                <select
                  value={config.model}
                  onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full bg-neutral-50 dark:bg-neutral-950/50 border-2 border-neutral-100 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100 outline-none focus:border-slate-river-500 focus:ring-4 focus:ring-slate-river-500/10 transition-all appearance-none cursor-pointer pr-10"
                >
                  {AI_MODELS[config.provider]?.map(group => (
                    <optgroup key={group.name} label={group.name}>
                      {group.models.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Base URL (for custom provider) */}
            {config.provider === 'custom' && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
                  {t.endpoint}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={config.baseUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://api.example.com/v1"
                    className="w-full bg-neutral-50 dark:bg-neutral-950/50 border-2 border-neutral-100 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 outline-none focus:border-slate-river-500 focus:ring-4 focus:ring-slate-river-500/10 transition-all pl-10"
                  />
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2">
              <Button
                size="lg"
                onClick={handleSave}
                className={`w-full py-4 rounded-xl text-base font-black shadow-xl transition-all ${
                  saved
                    ? 'bg-green-500 shadow-green/30'
                    : 'bg-slate-river-500 hover:bg-slate-river-400 shadow-slate-river/30'
                }`}
              >
                {saved ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {t.configSaved}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Server className="w-5 h-5" />
                    {t.saveConfig}
                  </div>
                )}
              </Button>
            </div>

            {/* Info Text */}
            <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 pt-2">
              {language === 'zh-TW'
                ? '配置僅保存在本地瀏覽器中，不會上傳到服務器。'
                : '配置仅保存在本地浏览器中，不会上传到服务器。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
