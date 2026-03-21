# ChronoFlow 部署与环境文档

## 1. 环境要求

### 开发环境

| 依赖 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | 前端运行环境 |
| npm | >= 9.0.0 | 包管理器 |
| Python | >= 3.10 | 后端运行环境 |
| Docker | >= 24.0 | 容器化部署 |
| Docker Compose | >= 2.20 | 多容器编排 |

### 生产环境

| 依赖 | 说明 |
|------|------|
| MySQL 8.0 | 数据库 |
| Nginx | 反向代理（可选） |
| SSL 证书 | HTTPS（推荐） |

---

## 2. 本地开发启动

### 方式 A：单机模式（无需后端）

```bash
# 1. 安装依赖
npm install

# 2. 启动前端开发服务器
npm run dev

# 3. 访问 http://localhost:5173
# 4. 点击"单机使用"进入应用
```

### 方式 B：完整模式（前端 + 后端）

#### 步骤 1：启动 Docker 服务

```bash
# 进入项目目录
cd /path/to/TaskTimer

# 启动 MySQL + Backend（首次会构建镜像）
docker-compose up -d mysql backend

# 查看服务状态
docker-compose ps

# 查看后端日志
docker-compose logs -f backend
```

#### 步骤 2：初始化数据库

```bash
# 进入后端容器
docker-compose exec backend bash

# 运行数据库迁移
alembic upgrade head

# 退出容器
exit
```

#### 步骤 3：启动前端

```bash
# 新开终端，启动前端
npm run dev
```

#### 步骤 4：验证服务

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost:5173 | React 开发服务器 |
| 后端 API | http://localhost:8000 | FastAPI 服务 |
| API 文档 | http://localhost:8000/docs | Swagger UI |
| MySQL | localhost:3306 | 数据库 |

---

## 3. Docker Compose 配置说明

### docker-compose.yml 核心配置

```yaml
services:
  # MySQL 数据库
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: chronoflow_root_password
      MYSQL_DATABASE: chronoflow
      MYSQL_USER: chronoflow
      MYSQL_PASSWORD: chronoflow_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4

  # 后端 API
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: mysql+pymysql://chronoflow:chronoflow_password@mysql:3306/chronoflow
      SECRET_KEY: ${SECRET_KEY:-change-this-in-production}
      AI_PROVIDER: ${AI_PROVIDER:-deepseek}
      AI_API_KEY: ${AI_API_KEY:-}
    depends_on:
      mysql:
        condition: service_healthy

  # 前端开发服务器
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "5173:5173"
    volumes:
      - ./:/app
      - /app/node_modules
    command: npm run dev --host
```

### 常用命令

```bash
# 启动所有服务
docker-compose up -d

# 启动指定服务
docker-compose up -d mysql backend

# 停止所有服务
docker-compose down

# 停止并删除数据卷（清空数据库）
docker-compose down -v

# 重新构建镜像
docker-compose build --no-cache

# 查看日志
docker-compose logs -f [service_name]

# 进入容器
docker-compose exec backend bash
docker-compose exec mysql mysql -u chronoflow -p
```

---

## 4. 环境变量配置

### 前端环境变量 (.env)

```env
# API 地址（云端模式）
VITE_API_URL=http://localhost:8000/api

# AI API Key（单机模式可选）
VITE_API_KEY=your_gemini_api_key
```

### 后端环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DATABASE_URL` | - | MySQL 连接字符串 |
| `SECRET_KEY` | - | JWT 签名密钥（生产环境必改） |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS 允许的源 |
| `DEBUG` | `false` | 调试模式 |
| `AI_PROVIDER` | `deepseek` | AI 提供商 |
| `AI_API_KEY` | - | AI API 密钥 |
| `AI_MODEL` | `deepseek-chat` | AI 模型 |
| `AI_BASE_URL` | - | 自定义 API 端点 |

### 生成安全密钥

```bash
# 生成 SECRET_KEY
openssl rand -hex 32
```

---

## 5. 数据库配置

### MySQL 连接字符串格式

```
mysql+pymysql://用户名:密码@主机:端口/数据库名
```

### 示例

```env
# Docker 内部连接
DATABASE_URL=mysql+pymysql://chronoflow:chronoflow_password@mysql:3306/chronoflow

# 本地直连
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/chronoflow
```

### 数据库迁移

```bash
# 查看迁移状态
alembic current

# 执行迁移
alembic upgrade head

# 回滚一个版本
alembic downgrade -1

# 创建新迁移
alembic revision --autogenerate -m "描述"
```

---

## 6. 生产部署

### 方式 A：Docker Compose 生产配置

```bash
# 使用生产配置文件
docker-compose -f docker-compose.prod.yml up -d
```

### 方式 B：手动部署

#### 1. 构建前端

```bash
npm run build
# 产物在 dist/ 目录
```

#### 2. 部署前端

将 `dist/` 目录部署到任意静态文件服务器（Nginx、Vercel、Netlify 等）

#### 3. 部署后端

```bash
# 安装依赖
cd backend
pip install -r requirements.txt

# 设置环境变量
export DATABASE_URL=mysql+pymysql://...
export SECRET_KEY=your-secret-key

# 运行迁移
alembic upgrade head

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        root /var/www/chronoflow/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 7. 故障排查

### 常见问题

| 问题 | 排查步骤 |
|------|----------|
| 前端无法连接后端 | 1. 检查后端是否启动 `docker-compose ps`<br>2. 检查 CORS 配置<br>3. 检查 VITE_API_URL |
| MySQL 连接失败 | 1. 检查 MySQL 容器状态<br>2. 检查连接字符串<br>3. 检查用户权限 |
| 登录后 Token 无效 | 1. 检查 SECRET_KEY 是否一致<br>2. 检查系统时间是否同步 |
| AI 功能不可用 | 1. 检查 AI_API_KEY 是否配置<br>2. 检查网络是否能访问 AI API |

### 查看日志

```bash
# Docker 服务日志
docker-compose logs -f backend

# Nginx 日志
tail -f /var/log/nginx/error.log

# 后端日志（非 Docker）
journalctl -u chronoflow-backend -f
```

---

## 8. 快速启动检查清单

```bash
# □ 1. 检查依赖
node -v && npm -v && docker -v

# □ 2. 安装前端依赖
npm install

# □ 3. 启动后端服务
docker-compose up -d mysql backend

# □ 4. 初始化数据库
docker-compose exec backend alembic upgrade head

# □ 5. 启动前端
npm run dev

# □ 6. 验证
# - 访问 http://localhost:5173
# - 访问 http://localhost:8000/docs
# - 注册用户并登录
```
