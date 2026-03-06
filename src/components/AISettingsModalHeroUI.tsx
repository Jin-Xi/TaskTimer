import React, { useState, useEffect } from 'react';
import { X, Key, Globe, Server, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS, AI_MODELS } from '../constants';
import { Language, AIConfig, AIProvider } from '../types';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from '@heroui/react';

const PROVIDER_OPTIONS: { value: AIProvider; label: string; desc: string }[] = [
  { value: 'gemini', label: 'Google Gemini', desc: 'geminiDesc' },
  { value: 'deepseek', label: 'DeepSeek', desc: 'deepseekDesc' },
  { value: 'openai', label: 'OpenAI', desc: 'OpenAI / 兼容服务' },
  { value: 'custom', label: '自定义', desc: '自定义端点' },
];

interface AISettingsModalHeroUIProps {
  language: Language;
  onClose: () => void;
}

export const AISettingsModalHeroUI: React.FC<AISettingsModalHeroUIProps> = ({ language, onClose }) => {
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
    <Modal
      isOpen={true}
      onClose={onClose}
      size="lg"
      classNames={{
        base: "max-w-[28rem]",
        wrapper: "bg-neutral-950/70 backdrop-blur-sm",
      }}
      motionProps={{
        variants: {
          enter: {
            scale: 1,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut"
            }
          },
          exit: {
            scale: 0.95,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn"
            }
          }
        }
      }}
    >
      <ModalContent className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
        <ModalHeader className="flex flex-col items-center gap-3 pb-0">
          <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-slate-river-400 to-slate-river-500 flex items-center justify-center shadow-lg">
            <Key className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight">
              {t.aiSettings}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mt-1">
              {language === 'zh-TW' ? '配置您的 AI 服務提供商' : '配置您的 AI 服务提供商'}
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="py-6">
          <div className="space-y-5">
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
                {t.provider}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDER_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    onClick={() => handleProviderChange(option.value)}
                    className={`h-auto py-3 px-4 rounded-xl text-left ${
                      config.provider === option.value
                        ? 'bg-slate-river-500 text-white'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div className="text-sm font-bold">{option.label}</div>
                    <div className={`text-xs mt-0.5 ${
                      config.provider === option.value ? 'text-slate-river-100' : 'text-neutral-400'
                    }`}>
                      {(t as any)[option.desc] || option.desc}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
                {t.apiKey}
              </label>
              <Input
                type="password"
                value={config.apiKey}
                onValueChange={(value) => setConfig(prev => ({ ...prev, apiKey: value }))}
                placeholder={language === 'zh-TW' ? '輸入您的 API 金鑰' : '输入您的 API 密钥'}
                startContent={<Key className="w-4 h-4 text-neutral-300" />}
                classNames={{
                  input: "text-sm font-medium",
                  inputWrapper: "bg-neutral-50 dark:bg-neutral-950/50 border-2 border-neutral-100 dark:border-neutral-800 rounded-xl",
                }}
              />
            </div>

            {/* Model Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
                {t.modelName}
              </label>
              <Select
                selectedKeys={[config.model]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setConfig(prev => ({ ...prev, model: selected }));
                }}
                classNames={{
                  trigger: "bg-neutral-50 dark:bg-neutral-950/50 border-2 border-neutral-100 dark:border-neutral-800 rounded-xl min-h-unit-12 py-3",
                  listbox: "bg-neutral-50 dark:bg-neutral-900",
                  popoverContent: "rounded-xl",
                }}
              >
                {AI_MODELS[config.provider]?.map(group => (
                  <SelectItem key={group.name} className="text-xs font-bold text-neutral-400">
                    {group.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Base URL (for custom provider) */}
            {config.provider === 'custom' && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">
                  {t.endpoint}
                </label>
                <Input
                  type="url"
                  value={config.baseUrl}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, baseUrl: value }))}
                  placeholder="https://api.example.com/v1"
                  startContent={<Globe className="w-4 h-4 text-neutral-300" />}
                  classNames={{
                    input: "text-sm font-medium",
                    inputWrapper: "bg-neutral-50 dark:bg-neutral-950/50 border-2 border-neutral-100 dark:border-neutral-800 rounded-xl",
                  }}
                />
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter className="pt-2">
          <Button
            size="lg"
            onClick={handleSave}
            className={`w-full py-4 rounded-xl text-base font-black shadow-xl ${
              saved ? 'bg-green-500 shadow-green/30' : 'bg-slate-river-500 shadow-slate-river/30'
            }`}
            endContent={saved ? <CheckCircle2 className="w-5 h-5" /> : <Server className="w-5 h-5" />}
          >
            {saved ? t.configSaved : t.saveConfig}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
