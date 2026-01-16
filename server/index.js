
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const DB_FILE = path.join(__dirname, 'db.json');
const PORT = 3001;

// Helper for relative timestamps
const minsAgo = (m) => Date.now() - (m * 60 * 1000);

// Initialize DB with rich demo data if not exists
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    tasks: [
      {
        id: 'task-demo-standalone',
        title: '深度阅读：生产力手册',
        description: '分析 ChronoFlow 的核心交互逻辑。',
        tags: ['Creative', 'Study'],
        status: 'COMPLETED',
        totalTime: 2700000, // 45 mins
        createdAt: minsAgo(120),
        logs: [{ start: minsAgo(105), end: minsAgo(60) }],
        milestones: [
          { id: 'm-s1', title: '完成前三章阅读', timestamp: minsAgo(90), branch: 'main' },
          { id: 'm-s2', title: '整理核心笔记', timestamp: minsAgo(65), branch: 'refine' }
        ],
        parentTaskIds: []
      },
      {
        id: 'task-p1',
        title: '需求分析与原型设计',
        tags: ['Work'],
        status: 'COMPLETED',
        totalTime: 3600000, // 60 mins
        createdAt: minsAgo(500),
        logs: [{ start: minsAgo(480), end: minsAgo(420) }],
        milestones: [{ id: 'm-p1', title: '导出原型图', timestamp: minsAgo(425), branch: 'main' }],
        projectId: 'project-demo-1',
        parentTaskIds: []
      },
      {
        id: 'task-p2',
        title: '核心计时逻辑开发',
        tags: ['Work'],
        status: 'COMPLETED',
        totalTime: 7200000, // 120 mins
        createdAt: minsAgo(400),
        logs: [{ start: minsAgo(380), end: minsAgo(260) }],
        milestones: [{ id: 'm-p2', title: 'Socket.IO 联调成功', timestamp: minsAgo(280), branch: 'main' }],
        projectId: 'project-demo-1',
        parentTaskIds: ['task-p1']
      },
      {
        id: 'task-p3',
        title: 'UI/UX 验收与部署',
        tags: ['Creative'],
        status: 'IDLE',
        totalTime: 0,
        createdAt: minsAgo(200),
        logs: [],
        milestones: [],
        projectId: 'project-demo-1',
        parentTaskIds: ['task-p2']
      }
    ],
    categories: [
      { id: 'c1', name: 'Study', color: 'indigo' },
      { id: 'c2', name: 'Exercise', color: 'emerald' },
      { id: 'c3', name: 'Work', color: 'slate' },
      { id: 'c4', name: 'Creative', color: 'rose' }
    ],
    projects: [
      {
        id: 'project-demo-1',
        name: 'ChronoFlow 2.0 升级计划',
        description: '包含核心引擎重构与 AI 教练集成。',
        createdAt: minsAgo(600),
        color: 'violet'
      }
    ]
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

io.on('connection', (socket) => {
  const db = readDB();
  socket.emit('init', db);

  socket.on('updateData', ({ type, data, action }) => {
    const currentDB = readDB();
    if (action === 'set') currentDB[type] = data;
    else if (action === 'add') currentDB[type].push(data);
    else if (action === 'update') currentDB[type] = currentDB[type].map(item => item.id === data.id ? { ...item, ...data } : item);
    else if (action === 'delete') currentDB[type] = currentDB[type].filter(item => item.id !== data.id);
    writeDB(currentDB);
    io.emit('sync_' + type, currentDB[type]);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
