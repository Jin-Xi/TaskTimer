/**
 * LoginModal Component
 *
 * Modal for login/register with offline mode option
 */
import { useState } from 'react';
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Tabs, Tab } from '@heroui/react';
import { HardDrive, Cloud, User, Lock, LogIn, UserPlus } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function LoginModal({ isOpen, onClose, language }: LoginModalProps) {
  const [selectedTab, setSelectedTab] = useState<string>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register, enterOfflineMode } = useAuthContext();
  const t = TRANSLATIONS[language];

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
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
      onClose();
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

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setError('');
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      size="sm"
      placement="center"
      hideCloseButton
      classNames={{
        wrapper: "bg-neutral-950/60 backdrop-blur-sm items-center",
        base: "rounded-2xl max-h-[90vh]",
      }}
      motionProps={{
        variants: {
          enter: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
          exit: { scale: 0.95, opacity: 0, transition: { duration: 0.15 } }
        }
      }}
    >
      <ModalContent className="bg-white dark:bg-neutral-900">
        <ModalHeader className="flex flex-col gap-0.5 pt-4 pb-0 px-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">ChronoFlow</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">选择使用方式</p>
        </ModalHeader>

        <ModalBody className="py-3 px-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs">
              {error}
            </div>
          )}

          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => {
              setSelectedTab(key as string);
              resetForm();
            }}
            variant="bordered"
            fullWidth
            classNames={{
              tabList: "gap-0",
              tab: "data-[selected=true]:bg-green-50 dark:data-[selected=true]:bg-green-900/20 text-xs py-1",
            }}
          >
            <Tab
              key="login"
              title={
                <div className="flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="text-xs">登录</span>
                </div>
              }
            >
              <div className="space-y-2 pt-3">
                <Input
                  type="text"
                  placeholder="用户名"
                  value={username}
                  onValueChange={setUsername}
                  startContent={<User className="w-3.5 h-3.5 text-neutral-400" />}
                  size="sm"
                  labelPlacement="outside"
                  classNames={{ inputWrapper: 'rounded-lg' }}
                />
                <Input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onValueChange={setPassword}
                  startContent={<Lock className="w-3.5 h-3.5 text-neutral-400" />}
                  size="sm"
                  labelPlacement="outside"
                  classNames={{ inputWrapper: 'rounded-lg' }}
                />
                <Button
                  color="primary"
                  size="sm"
                  className="w-full rounded-lg"
                  isLoading={loading}
                  isDisabled={loading}
                  onPress={handleLogin}
                >
                  登录
                </Button>
              </div>
            </Tab>

            <Tab
              key="register"
              title={
                <div className="flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="text-xs">注册</span>
                </div>
              }
            >
              <div className="space-y-2 pt-3">
                <Input
                  type="text"
                  placeholder="用户名"
                  value={username}
                  onValueChange={setUsername}
                  startContent={<User className="w-3.5 h-3.5 text-neutral-400" />}
                  size="sm"
                  labelPlacement="outside"
                  classNames={{ inputWrapper: 'rounded-lg' }}
                />
                <Input
                  type="password"
                  placeholder="密码（至少6位）"
                  value={password}
                  onValueChange={setPassword}
                  startContent={<Lock className="w-3.5 h-3.5 text-neutral-400" />}
                  size="sm"
                  labelPlacement="outside"
                  classNames={{ inputWrapper: 'rounded-lg' }}
                />
                <Button
                  color="success"
                  size="sm"
                  className="w-full rounded-lg"
                  isLoading={loading}
                  isDisabled={loading}
                  onPress={handleRegister}
                >
                  注册
                </Button>
              </div>
            </Tab>
          </Tabs>

          {/* Divider */}
          <div className="relative my-1.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-neutral-900 text-neutral-400">或</span>
            </div>
          </div>

          {/* Offline Mode */}
          <Button
            variant="bordered"
            size="sm"
            className="w-full rounded-lg"
            onPress={handleOfflineMode}
            startContent={<HardDrive className="w-3.5 h-3.5" />}
          >
            单机使用（无需登录）
          </Button>

          <div className="text-center text-[10px] text-neutral-400 space-y-0">
            <p>💾 数据保存在本地浏览器 · 🔑 AI 需自行配置 API Key</p>
          </div>
        </ModalBody>

        <ModalFooter className="pt-0 pb-3 px-4">
          <Button
            variant="light"
            size="sm"
            onPress={() => {
              resetForm();
              onClose();
            }}
            className="w-full"
          >
            取消
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
