
import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Spinner } from '@heroui/react';
import { AIMessageRole, AIMessage, TaskPreview, AIPlanningSession, AIConfig, Language } from '../types';
import { continuePlanningConversation } from '../services/aiService';

interface AIPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  mode: 'zero-state' | 'continuation';
  existingTasks?: any[];
  onConfirm: (tasks: TaskPreview[]) => void;
  language: Language;
}

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getAiConfig = (): AIConfig => {
  const saved = localStorage.getItem('chrono_ai_config');
  if (saved) return JSON.parse(saved);
  return {
    provider: 'gemini' as const,
    apiKey: '',
    model: 'gemini-2.5-flash-lite',
    baseUrl: ''
  };
};

const ChatMessage: React.FC<{ message: AIMessage; language: Language }> = ({ message, language }) => {
  const isUser = message.role === AIMessageRole.USER;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
        isUser
          ? 'bg-green-500 text-white'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
      }`}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

        {message.taskPreview && message.taskPreview.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.taskPreview.map((task, index) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl ${
                  task.isNew
                    ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-500'
                    : 'bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm">
                    T{index + 1}: {task.title}
                  </span>
                  {task.isNew && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                      {language === 'zh-TW' ? '新增' : '新增'}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs opacity-70 mt-1">{task.description}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs opacity-60">
                  {task.estimatedMinutes && (
                    <span>⏱ {task.estimatedMinutes}{language === 'zh-TW' ? '分鐘' : '分钟'}</span>
                  )}
                  {task.tag && (
                    <span>🏷 {task.tag}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const AIPlanningModal: React.FC<AIPlanningModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  mode,
  existingTasks = [],
  onConfirm,
  language
}) => {
  const [session, setSession] = useState<AIPlanningSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化会话
  useEffect(() => {
    if (isOpen && !session) {
      const newSession: AIPlanningSession = {
        id: generateUUID(),
        projectId,
        mode,
        messages: [],
        currentTasks: existingTasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          estimatedMinutes: t.estimatedTime ? Math.round(t.estimatedTime / 60000) : undefined,
          tag: t.tags?.[0],
          parentIds: t.parentTaskIds || [],
        })),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setSession(newSession);

      // 发送欢迎消息
      const welcomeMessage: AIMessage = {
        id: generateUUID(),
        role: AIMessageRole.ASSISTANT,
        content: mode === 'zero-state'
          ? (language === 'zh-TW'
            ? `你好！我是 AI 项目规划助手。\\n\\n项目「${projectName}」当前还没有任务流。\\n\\n請描述你的项目目標，我會為你生成完整的任務分解結構。`
            : `你好！我是 AI 项目规划助手。\\n\\n项目「${projectName}」当前还没有任务流。\\n\\n请描述你的项目目标，我会为你生成完整的任务分解结构。`)
          : (language === 'zh-TW'
            ? `你好！我是 AI 项目规划助手。\\n\\n项目「${projectName}」已有 ${existingTasks.length} 个任务。\\n\\n你可以要求我：\\n- 细化某个任务\\n- 添加新的任务\\n- 修改现有任务\\n\\n请告诉我你需要什么帮助？`
            : `你好！我是 AI 项目规划助手。\\n\\n项目「${projectName}」已有 ${existingTasks.length} 个任务。\\n\\n你可以要求我：\\n- 细化某个任务\\n- 添加新的任务\\n- 修改现有任务\\n\\n请告诉我你需要什么帮助？`),
        timestamp: Date.now()
      };
      setSession({ ...newSession, messages: [welcomeMessage] });
    }
  }, [isOpen, session]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !session || isLoading) return;

    const userMessage: AIMessage = {
      id: generateUUID(),
      role: AIMessageRole.USER,
      content: inputMessage,
      timestamp: Date.now()
    };

    const updatedSession = {
      ...session,
      messages: [...session.messages, userMessage],
      updatedAt: Date.now()
    };

    setSession(updatedSession);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await continuePlanningConversation(
        updatedSession,
        inputMessage,
        getAiConfig(),
        language
      );

      setSession({
        ...updatedSession,
        messages: [...updatedSession.messages, aiResponse],
        currentTasks: aiResponse.taskPreview || updatedSession.currentTasks,
        updatedAt: Date.now()
      });
    } catch (err: any) {
      setError(err.message || (language === 'zh-TW' ? 'AI 請求失敗' : 'AI 请求失败'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    console.log('handleConfirm called', { currentTasks: session?.currentTasks });
    if (session?.currentTasks && session.currentTasks.length > 0) {
      onConfirm(session.currentTasks);
      handleClose();
    }
  };

  const handleClose = () => {
    setSession(null);
    setInputMessage('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      hideCloseButton
      classNames={{
        wrapper: "bg-neutral-950/70 backdrop-blur-sm z-[120]",
        base: "rounded-[2.5rem] shadow-2xl overflow-hidden",
        backdrop: "bg-neutral-950/50",
      }}
      motionProps={{
        variants: {
          enter: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
          exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
        }
      }}
    >
      <ModalContent className="bg-white dark:bg-neutral-900 max-h-[85vh] flex flex-col">
        <ModalHeader className="flex-col items-start pt-6 pb-3 px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {language === 'zh-TW' ? 'AI 項目規劃' : 'AI 项目规划'}
            </h3>
          </div>
          <p className="text-sm text-neutral-400 mt-1 ml-9">{projectName}</p>
        </ModalHeader>

        <ModalBody className="flex flex-col px-6 pb-3 flex-1 min-h-0 overflow-hidden">
          {/* 对话历史区 */}
          <div className="flex-1 overflow-y-auto space-y-3 py-2 custom-scrollbar">
            {session?.messages.map((message) => (
              <ChatMessage key={message.id} message={message} language={language} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-neutral-400 pl-4">
                <Spinner size="sm" color="success" />
                <span className="text-sm">{language === 'zh-TW' ? 'AI 思考中...' : 'AI 思考中...'}</span>
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区 */}
          <div className="flex gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={language === 'zh-TW' ? '輸入你的要求...' : '输入你的要求...'}
              disabled={isLoading}
              className="flex-1 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-2.5 outline-none focus:border-green-500 dark:focus:border-green-400 font-medium text-sm transition-colors placeholder:text-neutral-400"
            />
            <Button
              onClick={handleSend}
              className="rounded-2xl px-5 font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
              isDisabled={!inputMessage.trim() || isLoading}
              size="md"
            >
              {language === 'zh-TW' ? '發送' : '发送'}
            </Button>
          </div>
        </ModalBody>

        <ModalFooter className="justify-end gap-3 px-6 pb-5 pt-2 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <Button
            variant="light"
            className="rounded-2xl px-5 font-medium text-neutral-600 dark:text-neutral-400"
            onPress={handleClose}
            size="md"
          >
            {language === 'zh-TW' ? '取消' : '取消'}
          </Button>
          <Button
            className="rounded-2xl px-5 font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
            onClick={handleConfirm}
            isDisabled={!session?.currentTasks?.length}
            size="md"
          >
            {language === 'zh-TW' ? '確認添加' : '确认添加'} ({session?.currentTasks?.length || 0})
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
