# 后端架构决策 - 任务清单

## 阶段一：后端基础设施搭建 ✅

### 1.1 项目初始化
- [x] 创建 backend 目录结构
- [x] 配置 Python 项目（requirements.txt, pyproject.toml）
- [x] 设置 FastAPI 应用入口（main.py）
- [x] 配置数据库连接（database.py）
- [x] 配置 Alembic 数据库迁移

### 1.2 数据库模型
- [x] 创建 User 模型（用户名 + 密码）
- [x] 创建 Project 模型
- [x] 创建 Category 模型
- [x] 创建 Task 模型（含依赖关系）
- [x] 创建 TimeLog 模型
- [x] 创建 Milestone 模型
- [x] 编写 Alembic 初始迁移脚本

### 1.3 CRUD 操作
- [x] 实现 User CRUD
- [x] 实现 Task CRUD
- [x] 实现 Project CRUD
- [x] 实现 Category CRUD
- [x] 实现任务依赖管理

### 1.4 用户认证系统
- [x] 实现 JWT Token 生成和验证
- [x] 实现密码哈希存储（bcrypt）
- [x] 实现注册 API（POST /api/auth/register）
- [x] 实现登录 API（POST /api/auth/login）
- [x] 实现登出 API（POST /api/auth/logout）
- [x] 实现获取当前用户 API（GET /api/auth/me）
- [x] 实现 Token 刷新 API（POST /api/auth/refresh）

### 1.5 默认数据初始化
- [x] 定义默认分类数据（chronoflow, ochre, terracotta, slate-river）
- [x] 实现新用户注册时自动创建默认分类

### 1.6 API 端点
- [x] 实现任务相关 API（GET/POST/PUT/DELETE /api/tasks）
- [x] 实现项目相关 API（GET/POST/PUT/DELETE /api/projects）
- [x] 实现分类相关 API（GET/POST/DELETE /api/categories）
- [x] 实现数据导入导出 API（GET /api/data/export, POST /api/data/import）

### 1.7 AI 服务代理
- [x] 实现 AI 配置管理（环境变量读取）
- [x] 实现生产力分析 API（POST /api/ai/analyze）
- [x] 实现项目规划 API（POST /api/ai/plan）

---

## 阶段二：前端认证系统开发 ✅

### 2.1 认证相关组件
- [x] 创建 useAppMode Hook（管理 offline/cloud 模式）
- [x] 创建 useAuth Hook（认证状态管理）
- [x] 创建 LoginPage 组件（含"单机使用"按钮）
- [x] 创建 RegisterPage 组件
- [x] 创建 AuthGuard 组件

### 2.2 认证服务
- [x] 创建 API 客户端（apiClient.ts）
- [x] 实现 Token 存储和刷新逻辑
- [x] 创建 AuthContext 提供者

### 2.3 路由配置
- [x] 配置 React Router（需要集成到 App.tsx）
- [x] 添加路由守卫（云端模式需要认证）
- [x] 单机模式无需登录验证

### 2.4 AI 配置差异
- [x] 单机模式：显示 AISettingsModal
- [x] 云端模式：隐藏 API Key 配置

---

## 阶段三：前端数据层改造 ✅

### 3.1 数据服务抽象
- [x] 创建 DataService 接口
- [x] 实现 LocalStorageDataService
- [x] 实现 APIDataService
- [x] 创建数据转换函数

### 3.2 React Hooks
- [x] 创建 useTasks Hook（集成数据服务）
- [x] 创建 useProjects Hook（集成数据服务）
- [x] 创建 useCategories Hook（集成数据服务）
- [ ] 集成 TanStack Query（可选）

### 3.3 数据层切换
- [x] 创建 getDataService 工厂函数
- [x] 根据模式自动切换数据源
- [x] 更新 App.tsx 使用新的数据服务

---

## 阶段四：Docker 部署配置 ✅

### 4.1 容器化配置
- [x] 创建后端 Dockerfile
- [x] 创建前端 Dockerfile
- [x] 创建 docker-compose.yml
- [x] 创建 Nginx 配置

### 4.2 部署脚本
- [x] 创建部署脚本（deploy.sh）
- [x] 创建环境变量示例文件

---

## 验证清单

- [ ] 后端 API 可通过 Postman/curl 测试
- [ ] 数据库表正确创建
- [ ] 认证功能正常工作
- [ ] 新用户注册后有默认分类数据
- [ ] 用户可以登录/登出
- [ ] 点击"单机使用"可进入离线模式
- [ ] 单机模式下数据保存在 localStorage
- [ ] 云端模式下数据保存在 MySQL
- [ ] AI 分析接口正常工作（云端模式）
- [ ] docker-compose up 启动所有服务

---

## 已创建的文件

### 后端文件 (backend/)
```
backend/
├── requirements.txt          # Python 依赖
├── pyproject.toml            # 项目配置
├── Dockerfile                # 后端容器配置
├── .env.example              # 环境变量示例
├── alembic.ini               # Alembic 配置
├── alembic/
│   ├── env.py                # Alembic 环境配置
│   ├── script.py.mako        # 迁移脚本模板
│   └── versions/
│       └── 001_initial.py    # 初始迁移脚本
└── app/
    ├── __init__.py
    ├── main.py               # FastAPI 应用入口
    ├── config.py             # 配置管理
    ├── database.py           # 数据库连接
    ├── models/
    │   └── __init__.py       # SQLAlchemy 模型
    ├── schemas/
    │   └── __init__.py       # Pydantic 模式
    ├── core/
    │   ├── __init__.py
    │   ├── auth.py           # JWT 认证
    │   ├── security.py       # 密码哈希
    │   ├── ai.py             # AI 服务代理
    │   └── default_data.py   # 默认数据
    ├── crud/
    │   ├── __init__.py
    │   ├── user.py           # 用户 CRUD
    │   ├── task.py           # 任务 CRUD
    │   ├── project.py        # 项目 CRUD
    │   └── category.py       # 分类 CRUD
    └── api/
        ├── __init__.py
        ├── deps.py           # 依赖注入
        ├── auth.py           # 认证 API
        ├── tasks.py          # 任务 API
        ├── projects.py       # 项目 API
        ├── categories.py     # 分类 API
        ├── ai.py             # AI API
        └── data.py           # 数据导入导出 API
```

### 前端文件 (src/)
```
src/
├── services/
│   ├── apiClient.ts          # API 客户端
│   └── dataService.ts        # 数据服务抽象层
├── hooks/
│   ├── index.ts
│   ├── useAppMode.ts         # 应用模式 Hook
│   └── useAuth.ts            # 认证 Hook
├── contexts/
│   └── AuthContext.tsx       # 认证上下文
└── components/
    └── auth/
        ├── index.ts
        ├── LoginPage.tsx     # 登录页面
        ├── RegisterPage.tsx  # 注册页面
        └── AuthGuard.tsx     # 认证守卫
```

### 部署文件
```
.
├── docker-compose.yml        # Docker 编排配置
├── Dockerfile.frontend       # 前端容器配置
└── deploy/
    ├── deploy.sh             # 部署脚本
    └── nginx/
        └── nginx.conf        # Nginx 配置
```
