/**
 * LoginPage Component
 *
 * Login page with username/password form and "offline mode" option
 */
import { useState } from 'react';
import { Button, Input } from '@heroui/react';
import { useAuthContext } from '../../contexts/AuthContext';

interface LoginPageProps {
  onRegisterClick: () => void;
}

export function LoginPage({ onRegisterClick }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, enterOfflineMode } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      // Navigation will be handled by parent component
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineMode = () => {
    enterOfflineMode();
    // Navigation will be handled by parent component
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            ChronoFlow
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            登录您的账户
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Username Input */}
          <Input
            type="text"
            label="用户名"
            placeholder="请输入用户名"
            value={username}
            onValueChange={setUsername}
            isRequired
            classNames={{
              inputWrapper: 'rounded-xl',
            }}
          />

          {/* Password Input */}
          <Input
            type="password"
            label="密码"
            placeholder="请输入密码"
            value={password}
            onValueChange={setPassword}
            isRequired
            classNames={{
              inputWrapper: 'rounded-xl',
            }}
          />

          {/* Login Button */}
          <Button
            type="submit"
            color="primary"
            className="w-full rounded-xl"
            isLoading={loading}
            isDisabled={loading}
          >
            登录
          </Button>

          {/* Register Link */}
          <div className="text-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              还没有账户？{' '}
            </span>
            <Button
              type="button"
              variant="light"
              className="text-primary-500"
              onPress={onRegisterClick}
            >
              立即注册
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-neutral-50 dark:bg-neutral-900 text-neutral-500">
              或
            </span>
          </div>
        </div>

        {/* Offline Mode Button */}
        <Button
          type="button"
          variant="bordered"
          className="w-full rounded-xl"
          onPress={handleOfflineMode}
        >
          单机使用（无需登录）
        </Button>

        {/* Offline Mode Info */}
        <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
          <p>💾 数据保存在本地浏览器</p>
          <p>🔑 AI 需自行配置 API Key</p>
        </div>
      </div>
    </div>
  );
}
