# ChronoFlow 系统架构文档

## 1. 项目概述

ChronoFlow 是一款现代化的效率管理应用，支持任务计时、项目规划、AI 智能分析等功能。系统采用**前后端分离架构**，支持**单机模式**（LocalStorage）和**云端模式**（MySQL + FastAPI）两种运行方式。

### 核心技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| UI 组件库 | HeroUI v2 + Tailwind CSS |
| 动画 | Framer Motion |
| 路由 | React Router v7 |
| 后端框架 | FastAPI (Python) |
| 数据库 | MySQL 8.0 |
| ORM | SQLAlchemy (异步) |
| AI 服务 | Google Gemini / DeepSeek / OpenAI |
| 容器化 | Docker + Docker Compose |

---

## 2. 目录结构

```
TaskTimer/
├── src/                          # 前端源码
│   ├── components/               # UI 组件
│   │   ├── TaskTimer.tsx         # 计时器主界面
│   │   ├── TaskList.tsx          # 任务列表（抽屉）
│   │   ├── ProjectManager.tsx    # 规划管理（流水线视图）
│   │   ├── AIPlanningModal.tsx   # AI 规划弹窗
│   │   ├── LoginModal.tsx        # 登录弹窗
│   │   ├── Drawer.tsx            # 通用抽屉组件
│   │   └── auth/                 # 认证相关组件
│   ├── services/                 # 服务层
│   │   ├── storageService.ts     # LocalStorage CRUD
│   │   ├── dataService.ts        # 云端数据服务
│   │   ├── aiService.ts          # AI 服务封装
│   │   └── apiClient.ts          # HTTP 客户端
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useAuth.ts            # 认证状态管理
│   │   ├── useAppMode.ts         # 单机/云端模式切换
│   │   └── useData.ts            # 数据 CRUD Hooks
│   ├── contexts/                 # React Context
│   │   └── AuthContext.tsx       # 认证上下文
│   ├── animations/               # 动画配置
│   ├── utils/                    # 工具函数
│   ├── types.ts                  # TypeScript 类型定义
│   ├── constants.ts              # 常量与翻译
│   ├── App.tsx                   # 根组件
│   └── main.tsx                  # 入口文件
│
├── backend/                      # 后端源码
│   ├── app/
│   │   ├── api/                  # API 路由
│   │   │   ├── auth.py           # 认证接口
│   │   │   ├── tasks.py          # 任务 CRUD
│   │   │   ├── projects.py       # 项目 CRUD
│   │   │   ├── categories.py     # 分类 CRUD
│   │   │   ├── ai.py             # AI 分析接口
│   │   │   └── data.py           # 数据同步接口
│   │   ├── crud/                 # 数据库操作层
│   │   ├── core/                 # 核心模块
│   │   │   ├── auth.py           # JWT 认证
│   │   │   ├── security.py       # 密码加密
│   │   │   └── ai.py             # AI 服务调用
│   │   ├── models/               # SQLAlchemy 模型
│   │   ├── schemas/              # Pydantic 模型
│   │   ├── config.py             # 配置管理
│   │   ├── database.py           # 数据库连接
│   │   └── main.py               # FastAPI 入口
│   ├── alembic/                  # 数据库迁移
│   └── requirements.txt          # Python 依赖
│
├── docker-compose.yml            # 开发环境编排
├── Dockerfile.frontend           # 前端容器
└── backend/Dockerfile            # 后端容器
```

---

## 3. 核心组件拆解

### 3.1 前端页面组件

| 组件 | 职责 |
|------|------|
| `App.tsx` | 根组件，管理全局状态（darkMode、language、activeTab），协调子组件 |
| `TaskTimer.tsx` | 计时器主界面，显示当前任务、计时控制、里程碑管理 |
| `TaskList.tsx` | 右侧抽屉内的任务列表，支持筛选、批量操作、分类管理 |
| `ProjectManager.tsx` | 规划管理页面，可视化任务流水线（WBS 结构） |
| `AIPlanningModal.tsx` | AI 规划弹窗，多轮对话生成任务规划 |
| `FullscreenFocus.tsx` | 全屏专注模式 |
| `Stats.tsx` | 数据统计与图表展示 |
| `LoginModal.tsx` | 登录/注册弹窗 |

### 3.2 后端 API 路由

| 路由 | 功能 |
|------|------|
| `POST /api/auth/register` | 用户注册 |
| `POST /api/auth/login` | 用户登录，返回 JWT |
| `POST /api/auth/refresh` | 刷新 Token |
| `GET /api/auth/me` | 获取当前用户信息 |
| `GET /api/tasks` | 获取任务列表 |
| `POST /api/tasks` | 创建任务 |
| `PUT /api/tasks/{id}` | 更新任务 |
| `DELETE /api/tasks/{id}` | 删除任务 |
| `GET /api/projects` | 获取项目列表 |
| `POST /api/ai/analyze` | AI 生产力分析 |
| `POST /api/ai/plan` | AI 任务规划 |

---

## 4. 数据模型

### 4.1 核心实体

```
┌─────────────┐     ┌─────────────┐
│    User     │────<│   Project   │
│             │     │             │
│ id          │     │ id          │
│ username    │     │ name        │
│ password_hash│    │ color       │
│ language    │     │ user_id (FK)│
│ theme       │     └──────┬──────┘
└──────┬──────┘            │
       │                   │
       │     ┌─────────────┴───┐
       │     │                 │
       └────<│      Task       │
             │                 │
             │ id              │
             │ title           │
             │ status          │
             │ total_time      │
             │ project_id (FK) │
             │ user_id (FK)    │
             │ parent_task_id  │ ← 链表结构，实现任务流水线
             └────────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────┴────┐  ┌────┴────┐  ┌────┴─────┐
   │TimeLog  │  │Milestone│  │Category  │
   └─────────┘  └─────────┘  └──────────┘
```

### 4.2 任务状态流转

```
IDLE ──▶ RUNNING ──▶ PAUSED ──▶ RUNNING
  │                   │
  │                   ▼
  └──────────────▶ COMPLETED
```

### 4.3 任务流水线结构

通过 `parentTaskId` 实现链表结构：

```
Task A (parentTaskId: null)
   │
   ▼
Task B (parentTaskId: A.id)
   │
   ▼
Task C (parentTaskId: B.id)
   │
   ▼
Task D (parentTaskId: C.id)
```

---

## 5. 双模式运行机制

### 5.1 单机模式（Offline）

```
┌─────────────────────────────────────┐
│           Browser                   │
│  ┌─────────────────────────────┐   │
│  │      React Application      │   │
│  │                             │   │
│  │  ┌───────────────────────┐  │   │
│  │  │   storageService.ts   │  │   │
│  │  │   (LocalStorage API)  │  │   │
│  │  └───────────────────────┘  │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      LocalStorage           │   │
│  │  - chrono_tasks_v3          │   │
│  │  - chrono_projects_v3       │   │
│  │  - chrono_categories_v3     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 5.2 云端模式（Cloud）

```
┌──────────────┐     HTTP/JSON     ┌──────────────┐
│   Frontend   │ ◀──────────────▶ │   Backend    │
│   (React)    │                   │   (FastAPI)  │
│              │                   │              │
│ apiClient.ts │                   │   api/*.py   │
│ useData.ts   │                   │   crud/*.py  │
└──────────────┘                   └──────┬───────┘
                                          │
                                          │ SQLAlchemy
                                          ▼
                                   ┌──────────────┐
                                   │    MySQL     │
                                   │   Database   │
                                   └──────────────┘
```

### 5.3 模式切换流程

```typescript
// hooks/useAppMode.ts
const enterOfflineMode = () => {
  localStorage.setItem('app_mode', 'offline');
  setMode('offline');
};

const enterCloudMode = () => {
  localStorage.setItem('app_mode', 'cloud');
  setMode('cloud');
};
```

---

## 6. 核心业务流程

### 6.1 用户登录流程

```
1. 用户点击"登录"按钮
2. 弹出 LoginModal
3. 输入用户名/密码
4. 调用 apiClient.post('/auth/login')
5. 后端验证密码，生成 JWT
6. 前端存储 access_token 到 localStorage
7. 切换到云端模式
8. useData hooks 开始从后端获取数据
```

### 6.2 任务计时流程

```
1. 用户点击任务播放按钮
2. 检查 parentTaskId 是否已完成（未完成则锁定）
3. 更新 task.status = RUNNING
4. 创建 TimeLog { start: Date.now() }
5. 启动定时器，每秒更新 totalTime
6. 用户点击暂停/完成
7. 更新 TimeLog { end: Date.now() }
8. 如果完成，status = COMPLETED
9. 同步到存储层（LocalStorage 或 API）
```

### 6.3 AI 规划流程

```
1. 用户在 ProjectManager 点击"AI 规划"
2. 打开 AIPlanningModal
3. 用户输入目标描述（如"我想为半程马拉松做训练"）
4. 调用 aiService.generateProjectPlan()
5. AI 返回结构化任务列表（带 parentTaskId 链）
6. 前端验证任务结构（validateAndFixTasks）
7. 渲染预览
8. 用户确认后，创建任务到存储层
```

---

## 7. 状态管理

项目采用 **React Hooks + Context** 进行状态管理，未使用 Redux 等第三方库。

### 全局状态

| 状态 | 存储位置 | 说明 |
|------|----------|------|
| `darkMode` | localStorage + App.tsx | 深色模式 |
| `language` | localStorage + App.tsx | 语言设置 |
| `appMode` | localStorage + AuthContext | 单机/云端模式 |
| `user` | AuthContext | 当前登录用户 |
| `tasks/projects/categories` | useData hooks | 业务数据 |

### 数据同步策略

- **单机模式**：直接读写 LocalStorage
- **云端模式**：通过 API 与后端同步，使用 SWR-like 策略（乐观更新 + 后台刷新）

---

## 8. AI 服务集成

### 支持的 AI 提供商

| 提供商 | 模型示例 | 配置方式 |
|--------|----------|----------|
| Google Gemini | gemini-2.0-flash | VITE_API_KEY 环境变量 |
| DeepSeek | deepseek-chat | AI 设置弹窗配置 |
| OpenAI | gpt-4o | AI 设置弹窗配置 |
| 自定义 | - | baseUrl + apiKey |

### AI 功能

1. **生产力分析** (`generateProductivityAnalysis`)
   - 输入：已完成的任务列表
   - 输出：总结、建议、生产力评分

2. **任务规划** (`generateProjectPlan`)
   - 输入：用户目标描述
   - 输出：结构化任务列表（带 parentTaskId 链）

3. **多轮对话** (`continuePlanningConversation`)
   - 输入：对话历史 + 用户消息
   - 输出：增量任务列表

---

## 9. 安全机制

### 认证流程

```
┌──────────┐    POST /auth/login    ┌──────────┐
│  Client  │ ────────────────────▶ │  Server  │
│          │ ◀──────────────────── │          │
└──────────┘   { access_token,     └──────────┘
                 refresh_token }
      │
      │ 存储 access_token
      ▼
┌──────────────────────────────────┐
│  后续请求 Header:                 │
│  Authorization: Bearer <token>   │
└──────────────────────────────────┘
```

### Token 刷新

- access_token 过期时，自动使用 refresh_token 刷新
- 刷新失败则清除本地 Token，跳转登录页

---

## 10. 关键设计决策

| 决策 | 原因 |
|------|------|
| 双模式运行 | 兼顾隐私（单机）和跨设备同步（云端） |
| parentTaskId 链表 | 简化任务依赖管理，便于流水线渲染 |
| HeroUI v2 | 现代化 UI 组件，内置动画和无障碍支持 |
| SQLAlchemy 异步 | 提升数据库 I/O 性能 |
| LocalStorage 版本化 (v3) | 便于数据结构升级迁移 |
