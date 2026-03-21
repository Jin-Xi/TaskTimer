# ChronoFlow 发布与维护文档

## 1. 版本发布流程

### 1.1 构建生产版本

```bash
# 1. 安装依赖
npm install

# 2. TypeScript 类型检查 + 构建
npm run build

# 3. 预览构建产物
npm run preview
```

### 1.2 构建产物说明

```
dist/
├── index.html              # 入口 HTML
├── assets/
│   ├── index-[hash].css    # 样式文件（约 65KB gzipped）
│   ├── index-[hash].js     # 主 JS（约 260KB gzipped）
│   └── index-[hash].js     # 大型依赖（约 330KB gzipped）
└── ...
```

### 1.3 发布检查清单

```bash
# □ 1. 运行测试
npm run test

# □ 2. 构建检查
npm run build

# □ 3. 预览验证
npm run preview
# 访问 http://localhost:4173 验证功能

# □ 4. 检查环境变量
# 确保 VITE_API_URL 指向生产 API

# □ 5. 部署 dist/ 目录
```

---

## 2. 版本号规范

采用语义化版本（Semantic Versioning）：

```
MAJOR.MINOR.PATCH

- MAJOR: 不兼容的 API 变更
- MINOR: 向后兼容的功能新增
- PATCH: 向后兼容的问题修复
```

### 示例

- `1.0.0` - 初始发布
- `1.1.0` - 新增 AI 规划功能
- `1.1.1` - 修复登录弹窗样式问题

---

## 3. 常见部署问题及排查

### 问题 1：前端白屏或路由 404

**现象**：刷新页面或直接访问非根路径时显示 404

**原因**：SPA 应用需要服务器将所有请求重定向到 index.html

**解决方案**：

```nginx
# Nginx 配置
location / {
    root /var/www/chronoflow/dist;
    try_files $uri $uri/ /index.html;
}
```

```javascript
// Vercel 配置 (vercel.json)
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 问题 2：API 请求 CORS 错误

**现象**：浏览器控制台显示 CORS policy 错误

**原因**：后端 CORS 配置未包含前端域名

**排查步骤**：

```bash
# 1. 检查后端 CORS 配置
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # 检查这里
    ...
)

# 2. 检查环境变量
echo $ALLOWED_ORIGINS

# 3. 检查前端 API 地址
# .env
VITE_API_URL=http://your-api-domain/api
```

**解决方案**：

```env
# 添加前端域名到 ALLOWED_ORIGINS
ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
```

---

### 问题 3：JWT Token 过期导致频繁登出

**现象**：用户使用过程中突然被登出

**原因**：access_token 过期且 refresh_token 刷新失败

**排查步骤**：

```bash
# 1. 检查 Token 有效期配置
# backend/app/config.py
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # access token 有效期
REFRESH_TOKEN_EXPIRE_DAYS = 7     # refresh token 有效期

# 2. 检查客户端 Token 存储
# 浏览器 DevTools > Application > Local Storage
# - access_token
# - refresh_token

# 3. 检查后端日志
docker-compose logs backend | grep -i token
```

**解决方案**：

```python
# 延长 Token 有效期
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 小时
REFRESH_TOKEN_EXPIRE_DAYS = 30    # 30 天
```

---

### 问题 4：AI 功能无响应

**现象**：点击 AI 分析或规划后无响应或报错

**原因**：AI API Key 未配置或网络问题

**排查步骤**：

```bash
# 1. 检查 AI 配置（单机模式）
# 浏览器 DevTools > Application > Local Storage
# 查看 chrono_ai_config

# 2. 检查 AI 配置（云端模式）
docker-compose exec backend env | grep AI_

# 3. 测试 AI API 连通性
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**解决方案**：

```env
# 配置 AI API Key
AI_PROVIDER=deepseek
AI_API_KEY=sk-xxxxx
AI_MODEL=deepseek-chat
```

---

## 4. 监控与日志

### 4.1 后端日志

```bash
# Docker 环境
docker-compose logs -f backend

# 查看 recent 错误
docker-compose logs backend | grep -i error | tail -50

# 非 Docker 环境
journalctl -u chronoflow-backend -f
```

### 4.2 前端错误监控

建议集成 Sentry 或类似服务：

```javascript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV,
});
```

### 4.3 数据库监控

```bash
# MySQL 连接数
docker-compose exec mysql mysql -e "SHOW STATUS LIKE 'Threads_connected';"

# 慢查询日志
docker-compose exec mysql mysql -e "SHOW VARIABLES LIKE 'slow_query_log';"
```

---

## 5. 备份与恢复

### 5.1 数据库备份

```bash
# 备份
docker-compose exec mysql mysqldump -u chronoflow -p chronoflow > backup.sql

# 恢复
docker-compose exec -T mysql mysql -u chronoflow -p chronoflow < backup.sql
```

### 5.2 LocalStorage 数据备份（单机模式）

用户可在浏览器中导出数据：
1. 打开 DevTools > Application > Local Storage
2. 复制 `chrono_tasks_v3`、`chrono_projects_v3`、`chrono_categories_v3`

---

## 6. 性能优化建议

### 前端

| 优化项 | 说明 |
|--------|------|
| 代码分割 | 使用动态 import() 拆分大型依赖 |
| 图片优化 | 使用 WebP 格式，懒加载 |
| 缓存策略 | 配置 Service Worker 或 CDN |

### 后端

| 优化项 | 说明 |
|--------|------|
| 数据库索引 | 确保 user_id、project_id 等字段有索引 |
| 连接池 | 配置 SQLAlchemy 连接池大小 |
| 响应压缩 | 启用 Gzip 压缩 |

---

## 7. 升级指南

### 数据库迁移

```bash
# 升级前备份
docker-compose exec mysql mysqldump -u chronoflow -p chronoflow > backup_$(date +%Y%m%d).sql

# 拉取最新代码
git pull

# 执行迁移
docker-compose exec backend alembic upgrade head

# 重启服务
docker-compose restart backend
```

### 前端升级

```bash
# 拉取最新代码
git pull

# 安装新依赖
npm install

# 重新构建
npm run build

# 部署 dist/ 目录
```

---

## 8. 回滚方案

### 快速回滚

```bash
# 回滚到上一个版本
git checkout HEAD~1

# 重新构建
npm run build

# 回滚数据库
docker-compose exec backend alembic downgrade -1
```

### 完整回滚

```bash
# 1. 恢复数据库
docker-compose exec -T mysql mysql -u chronoflow -p chronoflow < backup.sql

# 2. 切换代码版本
git checkout v1.0.0

# 3. 重新构建部署
npm install && npm run build
```
