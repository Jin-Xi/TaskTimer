/**
 * RegisterPage Component
 *
 * Registration page with username/password form
 */
import { useState } from 'react';
import { Button, Input } from '@heroui/react';
import { useAuthContext } from '../../contexts/AuthContext';

interface RegisterPageProps {
  onLoginClick: () => void;
}

export function RegisterPage({ onLoginClick }: RegisterPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuthContext();

  const validateForm = (): boolean => {
    if (username.length < 3) {
      setError('用户名至少需要 3 个字符');
      return false;
    }

    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      return false;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(username, password);
      // Navigation will be handled by parent component
    } catch (err: any) {
      setError(err.response?.data?.detail || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
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
            创建新账户
          </p>
        </div>

        {/* Register Form */}
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
            placeholder="请输入用户名（至少3位）"
            value={username}
            onValueChange={setUsername}
            isRequired
            description="用户名将用于登录"
            classNames={{
              inputWrapper: 'rounded-xl',
            }}
          />

          {/* Password Input */}
          <Input
            type="password"
            label="密码"
            placeholder="请输入密码（至少6位）"
            value={password}
            onValueChange={setPassword}
            isRequired
            description="密码至少需要6个字符"
            classNames={{
              inputWrapper: 'rounded-xl',
            }}
          />

          {/* Confirm Password Input */}
          <Input
            type="password"
            label="确认密码"
            placeholder="请再次输入密码"
            value={confirmPassword}
            onValueChange={setConfirmPassword}
            isRequired
            classNames={{
              inputWrapper: 'rounded-xl',
            }}
          />

          {/* Register Button */}
          <Button
            type="submit"
            color="primary"
            className="w-full rounded-xl"
            isLoading={loading}
            isDisabled={loading}
          >
            注册
          </Button>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              已有账户？{' '}
            </span>
            <Button
              type="button"
              variant="light"
              className="text-primary-500"
              onPress={onLoginClick}
            >
              立即登录
            </Button>
          </div>
        </form>

        {/* Terms */}
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
          注册即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
