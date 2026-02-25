# ChronoFlow 前后端分离架构改造方案

## 一、项目概述

### 1.1 当前架构

**技术栈：**
- 前端：React 19 + TypeScript + Vite + TailwindCSS
- 存储：浏览器 localStorage
- 部署：静态站点（Vercel/Netlify/GitHub Pages）

**数据流：**
```
用户 → UI组件 → App.tsx → storageService → localStorage → UI更新
```

**核心问题：**
1. 数据存储在客户端浏览器，换设备/浏览器后数据不同步
2. 本地存储容量有限（5-10MB）
3. 无法实现多设备协同
4. 数据无法备份和恢复
5. AI API Key 暴露在前端代码中

### 1.2 目标架构

**技术选型：**

| 层级 | 技术方案 | 说明 |
|------|----------|------|
| 前端 | React 19 + TypeScript + Vite | 保持不变 |
| 后端 | Python 3.11+ + FastAPI | 高性能异步 API 框架 |
| 数据库 | MySQL 8.0+ | 关系型数据库，事务支持 |
| ORM | SQLAlchemy 2.0 | Python ORM 框架 |
| 认证 | JWT + MySQL Session | 用户认证 |
| 部署 | 单机部署 Docker Compose | 前后端容器化部署 |

**新数据流：**
```
用户 → UI组件 → API Client → REST API → MySQL → UI更新
                         ↑_____________WebSocket____________↑
                                                   (实时同步)
```

**WebSocket 实时同步说明：**

WebSocket 是一种全双工通信协议，允许服务器主动向客户端推送消息。在本项目中，WebSocket 用于实现以下功能：

1. **多设备实时同步**
   - 当用户在设备 A 上创建/修改任务时
   - 服务器通过 WebSocket 推送变更到设备 B
   - 设备 B 自动更新界面，无需刷新页面

2. **协作场景支持**
   - 多个用户同时查看同一项目时
   - 一人修改，其他人实时看到变化

3. **减少轮询开销**
   - 传统方式需要前端定时轮询 API 检查更新
   - WebSocket 只在有变更时推送，节省带宽和服务器资源

4. **实时通知**
   - 任务依赖完成时通知
   - 项目里程碑达成提醒
   - AI 分析完成通知

**WebSocket 工作流程：**
```
客户端                                      服务器
   │                                           │
   │─────── 1. WebSocket 连接请求 ─────────────→│
   │     (携带 JWT Token 认证)                   │
   │                                           │
   │←────── 2. 连接成功，返回用户信息 ──────────│
   │                                           │
   │                                           │
   │                    3. 用户B创建任务        │
   │                    4. 数据库更新           │
   │←───── 5. 推送 task.created 事件 ──────────│
   │     (type: "task.created",                 │
   │      data: { task: {...} })                │
   │                                           │
   │     6. 前端自动更新任务列表                 │
   │                                           │
   │←───── 7. 推送 task.started 事件 ──────────│
   │     (其他用户开始任务时)                    │
   │                                           │
   │     8. 显示"某某正在处理任务XXX"            │
   │                                           │
```

---

## 二、目录结构设计

### 2.1 改造后的项目结构

```
TaskTimer/
├── frontend/                 # 前端项目（当前 src 移动至此）
│   ├── public/
│   ├── src/
│   │   ├── components/      # UI 组件
│   │   │   ├── auth/        # 认证相关组件
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── TaskTimer.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── ProjectManager.tsx
│   │   │   └── ...
│   │   ├── services/         # API 客户端服务
│   │   │   ├── api.ts        # API 请求封装
│   │   │   ├── auth.ts       # 认证服务
│   │   │   └── ws.ts         # WebSocket 客户端
│   │   ├── hooks/            # 自定义 Hooks
│   │   │   ├── useTasks.ts   # 任务数据 Hook
│   │   │   ├── useProjects.ts# 项目数据 Hook
│   │   │   └── useAuth.ts    # 认证 Hook
│   │   ├── pages/            # 页面组件
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── types/            # 类型定义
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                  # 后端项目（Python + FastAPI）
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI 应用入口
│   │   ├── config.py         # 配置管理
│   │   ├── database.py       # 数据库连接
│   │   ├── models/           # SQLAlchemy 模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── project.py
│   │   │   └── category.py
│   │   ├── schemas/          # Pydantic 模型（API 数据验证）
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── project.py
│   │   │   └── category.py
│   │   ├── crud/             # 数据库操作（CRUD）
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   ├── project.py
│   │   │   └── category.py
│   │   ├── api/              # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── deps.py       # 依赖注入
│   │   │   ├── auth.py       # 认证相关
│   │   │   ├── tasks.py      # 任务 API
│   │   │   ├── projects.py   # 项目 API
│   │   │   ├── categories.py # 分类 API
│   │   │   ├── ai.py         # AI 功能 API
│   │   │   └── websocket.py  # WebSocket
│   │   ├── core/             # 核心业务逻辑
│   │   │   ├── __init__.py
│   │   │   ├── auth.py       # 认证逻辑（JWT）
│   │   │   ├── security.py   # 密码哈希
│   │   │   └── ai.py         # AI 服务调用
│   │   └── utils/            # 工具函数
│   │       ├── __init__.py
│   │       └── helpers.py
│   ├── tests/                # 测试文件
│   │   ├── __init__.py
│   │   ├── test_api.py
│   │   └── test_crud.py
│   ├── alembic/              # 数据库迁移
│   │   └── versions/
│   ├── requirements.txt      # Python 依赖
│   ├── pyproject.toml       # 项目配置
│   ├── Dockerfile
│   └── .env.example          # 环境变量示例
│
├── shared/                   # 共享代码
│   ├── types/                # 共享类型定义
│   │   └── index.ts
│   └── constants/            # 共享常量
│       └── index.ts
│
├── docker-compose.yml        # Docker 编排配置
├── .env.example              # 环境变量示例
├── deploy.sh                 # 部署脚本
│
└── doc/                      # 文档目录
    └── ...
```

---

## 三、后端 API 设计（Python + FastAPI）

### 3.1 RESTful API 端点

#### 认证相关
```
POST   /api/auth/register      # 用户注册
POST   /api/auth/login         # 用户登录
POST   /api/auth/logout        # 用户登出
GET    /api/auth/me            # 获取当前用户信息
POST   /api/auth/refresh       # 刷新 Token
```

#### 任务相关
```
GET    /api/tasks              # 获取用户所有任务
GET    /api/tasks/:id          # 获取单个任务详情
POST   /api/tasks              # 创建新任务
PUT    /api/tasks/:id          # 更新任务
DELETE /api/tasks/:id          # 删除任务
DELETE /api/tasks              # 批量删除任务
POST   /api/tasks/:id/start    # 开始任务
POST   /api/tasks/:id/pause    # 暂停任务
POST   /api/tasks/:id/complete # 完成任务
GET    /api/tasks/project/:projectId  # 获取项目下所有任务
```

#### 项目相关
```
GET    /api/projects           # 获取用户所有项目
GET    /api/projects/:id       # 获取项目详情
POST   /api/projects           # 创建项目
PUT    /api/projects/:id       # 更新项目
DELETE /api/projects/:id       # 删除项目
GET    /api/projects/:id/tasks # 获取项目任务
```

#### 分类相关
```
GET    /api/categories         # 获取用户所有分类
POST   /api/categories         # 创建分类
DELETE /api/categories/:id     # 删除分类
```

#### AI 功能相关
```
POST   /api/ai/analyze         # 生产力分析
POST   /api/ai/plan            # AI 项目规划
```

#### 数据导入导出
```
GET    /api/data/export        # 导出用户数据
POST   /api/data/import        # 导入数据
```

### 3.2 WebSocket 实时同步

```python
# WebSocket 事件类型
from enum import Enum
from pydantic import BaseModel

class WSEventType(str, Enum):
    # 任务事件
    TASK_CREATED = "task.created"
    TASK_UPDATED = "task.updated"
    TASK_DELETED = "task.deleted"
    TASK_STARTED = "task.started"
    TASK_PAUSED = "task.paused"
    TASK_COMPLETED = "task.completed"

    # 项目事件
    PROJECT_CREATED = "project.created"
    PROJECT_UPDATED = "project.updated"
    PROJECT_DELETED = "project.deleted"

    # 连接事件
    USER_CONNECTED = "user.connected"
    USER_DISCONNECTED = "user.disconnected"

class WSEvent(BaseModel):
    type: WSEventType
    data: dict
    user_id: str
    timestamp: float
```

**WebSocket 端点：**
```
WS     /ws                     # WebSocket 连接端点
```

**连接流程：**
1. 客户端建立 WebSocket 连接，携带 JWT Token
2. 服务器验证 Token，获取用户 ID
3. 将连接加入用户的连接池
4. 当有数据变更时，服务器向该用户的所有连接推送事件
5. 客户端接收事件，更新本地状态

---

## 四、前端用户认证设计

### 4.1 认证相关组件

#### 登录页面组件

```typescript
// frontend/src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            ChronoFlow
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            登录您的账户
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="邮箱地址"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="密码"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              还没有账户？{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                立即注册
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
```

#### 注册页面组件

```typescript
// frontend/src/pages/RegisterPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, username);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            ChronoFlow
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            创建新账户
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="用户名（可选）"
              />
            </div>
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="邮箱地址"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="密码（至少6位）"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="确认密码"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              已有账户？{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                立即登录
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
```

#### 认证 Hook

```typescript
// frontend/src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    username?: string;
  };
}

interface User {
  id: string;
  email: string;
  username?: string;
  language: string;
  theme: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时检查登录状态
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const userData = await apiClient.get<User>('/auth/me');
        setUser(userData);
      }
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    setUser(response.user);

    // 连接 WebSocket
    const { wsClient } = await import('../services/ws');
    wsClient.connect(response.access_token);
  };

  const register = async (email: string, password: string, username?: string) => {
    const response = await apiClient.post<LoginResponse>('/auth/register', {
      email,
      password,
      username,
    });

    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    setUser(response.user);

    // 连接 WebSocket
    const { wsClient } = await import('../services/ws');
    wsClient.connect(response.access_token);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);

      // 断开 WebSocket
      const { wsClient } = await import('../services/ws');
      wsClient.disconnect();
    }
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    localStorage.setItem('access_token', response.access_token);
    return response.access_token;
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken,
  };
}
```

#### 路由守卫组件

```typescript
// frontend/src/components/auth/AuthGuard.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### 4.2 认证服务

```typescript
// frontend/src/services/auth.ts
import axios, { AxiosInstance } from 'axios';

class AuthClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 响应拦截器：处理 Token 过期
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            const response = await this.client.post('/auth/refresh', {
              refresh_token: refreshToken,
            });

            const { access_token } = response.data;
            localStorage.setItem('access_token', access_token);

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string, username?: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      username,
    });
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser() {
    const token = localStorage.getItem('access_token');
    const response = await this.client.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}

export const authClient = new AuthClient();
```

### 4.3 App.tsx 路由配置

```typescript
// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './components/auth/AuthGuard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Dashboard } from './pages/Dashboard';
// ... 其他导入

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 需要认证的路由 */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 4.4 用户菜单组件

```typescript
// frontend/src/components/UserMenu.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
          {user?.username?.[0]?.toUpperCase() || user?.email[0]?.toUpperCase()}
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {user?.username || user?.email}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1">
          <div className="px-4 py-2 border-b dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.username || '用户'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 五、数据模型设计（MySQL + SQLAlchemy）

### 5.1 数据库 Schema

```sql
-- 用户表
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    language VARCHAR(10) DEFAULT 'zh-CN',
    theme VARCHAR(10) DEFAULT 'dark',
    ai_config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 项目表
CREATE TABLE projects (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE categories (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 任务表
CREATE TABLE tasks (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    project_id CHAR(36),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    tags JSON,
    status VARCHAR(20) NOT NULL,
    total_time BIGINT DEFAULT 0,
    estimated_time BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 任务依赖表（多对多）
CREATE TABLE task_dependencies (
    id CHAR(36) PRIMARY KEY,
    task_id CHAR(36) NOT NULL,
    parent_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_parent_id (parent_id),
    UNIQUE KEY uk_task_parent (task_id, parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 时间日志表
CREATE TABLE time_logs (
    id CHAR(36) PRIMARY KEY,
    task_id CHAR(36) NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    duration BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 里程碑表
CREATE TABLE milestones (
    id CHAR(36) PRIMARY KEY,
    task_id CHAR(36) NOT NULL,
    name VARCHAR(255),
    task_time BIGINT NOT NULL,
    branch_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_branch_name (task_id, branch_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 六、前端 API 客户端改造

### 6.1 API 客户端服务

```typescript
// frontend/src/services/api.ts
import axios, { AxiosInstance } from 'axios';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器：添加认证 Token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 响应拦截器：处理错误和 Token 刷新
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token 刷新逻辑已在 auth.ts 中处理
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  async patch<T>(url: string, data: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }
}

export const apiClient = new APIClient();
```

### 6.2 WebSocket 客户端

```typescript
// frontend/src/services/ws.ts
type WSEventHandler = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<WSEventHandler>> = new Map();
  private isConnected = false;

  connect(token?: string) {
    const wsToken = token || localStorage.getItem('access_token');
    if (!wsToken) {
      console.warn('No token available for WebSocket connection');
      return;
    }

    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws?token=${wsToken}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.clearReconnectTimer();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.emit(message.type, message.data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');
      this.isConnected = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  on(event: string, callback: WSEventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // 返回取消订阅函数
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebSocket event handler for ${event}:`, error);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect();
    }, 5000);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  disconnect() {
    this.clearReconnectTimer();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  getConnectionState() {
    return this.isConnected;
  }
}

export const wsClient = new WebSocketClient();
```

### 6.3 React Hooks（TanStack Query）

```typescript
// frontend/src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '../services/api';
import { wsClient } from '../services/ws';
import type { Task } from '../types';

export function useTasks() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => apiClient.get<Task[]>('/tasks'),
  });

  // WebSocket 实时更新
  useEffect(() => {
    const unsubscribeTaskCreated = wsClient.on('task.created', (newTask) => {
      queryClient.setQueryData(['tasks'], (old: Task[] | undefined) => {
        return old ? [...old, newTask] : [newTask];
      });
    });

    const unsubscribeTaskUpdated = wsClient.on('task.updated', (updatedTask) => {
      queryClient.setQueryData(['tasks'], (old: Task[] | undefined) => {
        return old?.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });
    });

    const unsubscribeTaskDeleted = wsClient.on('task.deleted', ({ task_id }) => {
      queryClient.setQueryData(['tasks'], (old: Task[] | undefined) => {
        return old?.filter(task => task.id !== task_id);
      });
    });

    return () => {
      unsubscribeTaskCreated();
      unsubscribeTaskUpdated();
      unsubscribeTaskDeleted();
    };
  }, [queryClient]);

  const createTask = useMutation({
    mutationFn: (task: Omit<Task, 'id'>) =>
      apiClient.post<Task>('/tasks', task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Task>) =>
      apiClient.put<Task>(`/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks,
    isLoading,
    createTask: createTask.mutateAsync,
    updateTask: updateTask.mutateAsync,
    deleteTask: deleteTask.mutateAsync,
  };
}
```

---

## 七、Docker 部署配置

### 7.1 docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: chronoflow_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: chronoflow_root_password
      MYSQL_DATABASE: chronoflow
      MYSQL_USER: chronoflow
      MYSQL_PASSWORD: chronoflow_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./deploy/mysql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: chronoflow_backend
    restart: always
    environment:
      DATABASE_URL: mysql+pymysql://chronoflow:chronoflow_password@mysql:3306/chronoflow
      SECRET_KEY: ${SECRET_KEY:-change-this-in-production}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS:-http://localhost:3000,http://localhost:5173}
      OPENAI_API_KEY: ${OPENAI_API_KEY:-}
      DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY:-}
    ports:
      - "8000:8000"
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: chronoflow_frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  nginx:
    image: nginx:alpine
    container_name: chronoflow_nginx
    restart: always
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./deploy/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend

volumes:
  mysql_data:
```

### 7.2 Nginx 配置

```nginx
# deploy/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/log/nginx/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentypefont
               application/vnd.ms-fontobject image/svg+xml;

    # 后端 API 代理
    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name _;

        # 前端静态文件
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;

            # 缓存静态资源
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # 后端 API 代理
        location /api/ {
            proxy_pass http://backend:8000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket 支持
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # WebSocket 支持
        location /ws {
            proxy_pass http://backend:8000/ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_read_timeout 86400;
        }
    }
}
```

---

## 八、实施步骤

### 阶段一：后端基础设施搭建

**目标：** 完成后端项目初始化和核心功能开发

**步骤清单：**
1. 初始化 Python 项目结构
   - 创建 backend 目录
   - 配置 FastAPI + SQLAlchemy + MySQL
   - 设置 Alembic 数据库迁移

2. 设计并实现数据库 Schema
   - 创建用户、任务、项目、分类表
   - 设置外键关系和索引
   - 编写 Alembic 迁移脚本

3. 实现 CRUD 操作
   - 任务 CRUD
   - 项目 CRUD
   - 分类 CRUD
   - 任务依赖管理

4. 实现用户认证系统
   - JWT Token 生成和验证
   - 密码哈希存储
   - 注册/登录 API
   - Token 刷新机制

**验证标准：**
- 所有 API 端点可通过 Postman/curl 测试
- 数据库表正确创建
- 认证功能正常工作

---

### 阶段二：前端认证系统开发

**目标：** 完成前端用户认证功能

**步骤清单：**
1. 创建认证相关组件
   - LoginPage 组件
   - RegisterPage 组件
   - AuthGuard 组件
   - UserMenu 组件

2. 实现认证服务
   - auth.ts 认证客户端
   - useAuth Hook
   - Token 存储和刷新逻辑

3. 配置路由
   - 设置 React Router
   - 添加路由守卫
   - 处理未登录重定向

**验证标准：**
- 用户可以成功注册
- 用户可以登录/登出
- 未登录访问受保护页面自动跳转登录页
- Token 过期自动刷新

---

### 阶段三：前端数据层改造

**目标：** 将 localStorage 迁移到 API 调用

**步骤清单：**
1. 创建 API 客户端服务
   - api.ts 请求封装
   - 请求/响应拦截器
   - 错误处理

2. 实现 React Hooks
   - useTasks Hook
   - useProjects Hook
   - useCategories Hook

3. 集成 TanStack Query
   - 配置 QueryClient
   - 设置缓存策略
   - 处理乐观更新

4. 替换所有 localStorage 调用
   - 更新 App.tsx 状态管理
   - 修改各组件的数据获取方式

**验证标准：**
- 所有 CRUD 操作通过 API 完成
- 数据正确显示在界面上
- 错误处理正常

---

### 阶段四：WebSocket 实时同步

**目标：** 实现多设备实时数据同步

**步骤清单：**
1. 后端 WebSocket 实现
   - 连接管理器
   - 事件广播逻辑
   - 认证集成

2. 前端 WebSocket 客户端
   - 连接和重连逻辑
   - 事件订阅机制
   - 与 TanStack Query 集成

3. 实时更新测试
   - 多设备同步测试
   - 断线重连测试
   - 性能测试

**验证标准：**
- 一台设备修改数据，另一台设备实时更新
- 断线后自动重连
- 连接状态正确显示

---

### 阶段五：数据迁移工具

**目标：** 实现旧数据导入功能

**步骤清单：**
1. 后端数据导入 API
   - 解析 localStorage 格式
   - 数据验证
   - 批量导入逻辑

2. 前端迁移工具
   - 导出 localStorage 数据
   - 上传到服务器
   - 进度显示
   - 错误处理

3. 测试和验证
   - 完整数据迁移测试
   - 回滚机制测试

**验证标准：**
- 可以成功导入旧数据
- 数据完整性检查通过
- 迁移失败可以回滚

---

### 阶段六：容器化部署

**目标：** 完成生产环境部署配置

**步骤清单：**
1. 编写 Dockerfile
   - 后端 Dockerfile
   - 前端 Dockerfile

2. 配置 docker-compose
   - MySQL 服务
   - 后端服务
   - 前端服务
   - Nginx 反向代理

3. Nginx 配置
   - 静态文件服务
   - API 代理
   - WebSocket 支持

4. 部署测试
   - 本地 Docker 测试
   - 生产环境部署
   - 性能优化

**验证标准：**
- docker-compose up 启动所有服务
- 前端可以访问
- API 正常响应
- WebSocket 连接成功

---

### 阶段七：优化和文档

**目标：** 完善功能和编写文档

**步骤清单：**
1. 性能优化
   - API 响应优化
   - 前端加载优化
   - 数据库查询优化

2. 安全加固
   - HTTPS 配置
   - Rate Limiting
   - CORS 配置检查

3. 文档编写
   - API 文档
   - 部署文档
   - 用户手册

**验证标准：**
- API 响应时间 < 200ms
- 安全扫描通过
- 文档完整

---

## 九、环境配置

### 9.1 后端环境变量

```bash
# backend/.env
# 应用配置
APP_NAME=ChronoFlow
DEBUG=false
SECRET_KEY=your-super-secret-jwt-key-change-in-production

# 数据库配置
DATABASE_URL=mysql+pymysql://chronoflow:chronoflow_password@localhost:3306/chronoflow

# JWT 配置
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS 配置
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-domain.com

# AI 服务（后端代理，保护 API Key）
OPENAI_API_KEY=sk-xxx
DEEPSEEK_API_KEY=sk-xxx

# Redis（可选，用于 WebSocket 广播）
REDIS_URL=redis://localhost:6379/0
```

### 9.2 前端环境变量

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

### 9.3 生产环境变量

```bash
# .env.production
VITE_API_URL=https://api.your-domain.com/api
VITE_WS_URL=wss://api.your-domain.com
```

---

## 十、单机部署优势

### 10.1 部署简单

```bash
# 一键启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 10.2 资源利用

- **低配置要求**：2核4G内存即可运行
- **成本低廉**：单台 VPS（¥50-100/月）即可
- **维护简单**：单一服务器，便于管理

### 10.3 扩展方案

当用户增长时，可以平滑迁移到分布式架构：

```
单机架构 → 分布式架构
├── 数据库读写分离
├── Redis 缓存层
├── 负载均衡
└── 多容器部署
```

---

## 十一、风险与注意事项

### 11.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 数据迁移失败 | 高 | 提供备份和回滚机制 |
| API 兼容性问题 | 中 | 严格的版本控制和测试 |
| WebSocket 连接不稳定 | 中 | 实现自动重连和降级方案 |
| 数据库性能 | 中 | 添加索引、查询优化 |

### 11.2 安全考虑

1. **HTTPS 强制**：生产环境必须使用 HTTPS
2. **SQL 注入防护**：使用 ORM 参数化查询
3. **XSS 防护**：输入验证和输出转义
4. **Rate Limiting**：防止 API 滥用
5. **CORS 配置**：严格的跨域限制
6. **密码安全**：使用 bcrypt 哈希，加盐存储
7. **JWT 安全**：设置合理的过期时间，使用强密钥

### 11.3 运营成本（月）

| 服务 | 免费方案 | VPS 方案 |
|------|----------|----------|
| 后端 + 数据库 | Railway $0 / 自建 | ¥50-100/月 |
| 前端托管 | Vercel $0 | ¥0（Nginx 自建） |
| 域名 | - | ¥10/年 |
| **总计** | **$0** | **¥50-110/月** |

---

## 十二、总结

前后端分离改造后，ChronoFlow 将获得：

✅ **多设备同步**：随时随地访问您的任务数据
✅ **数据安全**：MySQL 持久化，定期备份
✅ **Python 生态**：丰富的库和工具，便于维护
✅ **性能提升**：异步框架 + 数据库优化
✅ **可扩展性**：单机部署，便于后续扩展
✅ **实时协作**：WebSocket 支持多设备实时同步
✅ **用户认证**：安全的多用户支持

**关键文件清单：**

- 后端：`backend/app/main.py`, `backend/app/api/`, `backend/app/models/`
- 前端：`frontend/src/services/api.ts`, `frontend/src/hooks/`, `frontend/src/pages/`
- 部署：`docker-compose.yml`, `deploy/nginx/`
- 数据库：`deploy/mysql/init.sql`