/**
 * LoginModal Component
 *
 * Modal for login/register with offline mode option
 * 极简线条风格
 */
import { useState } from 'react';
import { Modal, ModalContent } from '@heroui/react';
import { HardDrive, User, Lock, X } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function LoginModal({ isOpen, onClose, language }: LoginModalProps) {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { login, register, enterOfflineMode } = useAuthContext();
  const t = TRANSLATIONS[language];

  const handleLogin = async () => {
    setError('');
    setSuccess('');
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      setSuccess('登录成功！');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), password);
      setSuccess('注册成功，即将进入应用！');
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.response?.data?.detail || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineMode = () => {
    enterOfflineMode();
    onClose();
  };

  const handleSubmit = () => {
    if (view === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
    setFocusedField(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchView = (newView: 'login' | 'register') => {
    setView(newView);
    resetForm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      placement="center"
      hideCloseButton
      classNames={{
        wrapper: "bg-neutral-950/60 backdrop-blur-sm items-center",
        base: "rounded-2xl",
      }}
      motionProps={{
        variants: {
          enter: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
          exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } }
        }
      }}
    >
      <ModalContent className="bg-white dark:bg-neutral-900 p-6 relative">
        {/* Close button - top right */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-neutral-300 hover:text-neutral-500 transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Tab switcher - centered */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={() => switchView('login')}
            className={`pb-2 text-sm transition-all ${
              view === 'login'
                ? 'text-neutral-800 dark:text-neutral-200 border-b-2 border-emerald-500'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => switchView('register')}
            className={`pb-2 text-sm transition-all ${
              view === 'register'
                ? 'text-neutral-800 dark:text-neutral-200 border-b-2 border-emerald-500'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            注册
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="text-green-500 text-xs text-center mb-4">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-xs text-center mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          {/* Username input - single line style */}
          <div className={`flex items-center gap-3 py-2 border-b transition-colors ${
            focusedField === 'username' ? 'border-emerald-500' : 'border-gray-200 dark:border-neutral-700'
          }`}>
            <User className={`w-4 h-4 shrink-0 transition-colors ${
              focusedField === 'username' ? 'text-emerald-500' : 'text-neutral-300'
            }`} strokeWidth={1.5} />
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-300"
            />
          </div>

          {/* Password input - single line style */}
          <div className={`flex items-center gap-3 py-2 border-b transition-colors ${
            focusedField === 'password' ? 'border-emerald-500' : 'border-gray-200 dark:border-neutral-700'
          }`}>
            <Lock className={`w-4 h-4 shrink-0 transition-colors ${
              focusedField === 'password' ? 'text-emerald-500' : 'text-neutral-300'
            }`} strokeWidth={1.5} />
            <input
              type="password"
              placeholder={view === 'register' ? '密码（至少6位）' : '密码'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-300"
            />
          </div>

          {/* Submit button - outlined style */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-2.5 rounded-md border text-sm font-medium transition-all ${
              loading
                ? 'border-neutral-200 text-neutral-400 cursor-not-allowed'
                : view === 'login'
                  ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                  : 'border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            {loading ? '处理中...' : view === 'login' ? '登录' : '注册'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 border-t border-gray-100 dark:border-neutral-800" />
            <span className="text-xs text-neutral-300">或</span>
            <div className="flex-1 border-t border-gray-100 dark:border-neutral-800" />
          </div>

          {/* Offline mode button - lighter border */}
          <button
            onClick={handleOfflineMode}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border border-gray-200 dark:border-neutral-700 text-sm text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            <HardDrive className="w-4 h-4" strokeWidth={1.5} />
            <span>单机使用</span>
          </button>

          {/* Hint text */}
          <p className="text-center text-[10px] text-neutral-400">
            数据保存在本地浏览器 · AI 需自行配置 API Key
          </p>
        </div>
      </ModalContent>
    </Modal>
  );
}
