
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
    origin: "*", // Allow connections from any IP in the LAN
    methods: ["GET", "POST"]
  }
});

const DB_FILE = path.join(__dirname, 'db.json');
const PORT = 3001;

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    tasks: [],
    categories: [
      { id: 'c1', name: 'Study', color: 'indigo' },
      { id: 'c2', name: 'Exercise', color: 'emerald' },
      { id: 'c3', name: 'Work', color: 'slate' },
      { id: 'c4', name: 'Creative', color: 'rose' }
    ],
    projects: []
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Helper to read/write
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial data immediately upon connection
  const db = readDB();
  socket.emit('init', db);

  // Handle Updates
  socket.on('updateData', ({ type, data, action }) => {
    // type: 'tasks' | 'categories' | 'projects'
    // action: 'add' | 'update' | 'delete' | 'set'
    const currentDB = readDB();
    
    if (action === 'set') {
        // Replace entire array (useful for reordering or heavy updates)
        currentDB[type] = data;
    } else if (action === 'add') {
        currentDB[type].push(data);
    } else if (action === 'update') {
        currentDB[type] = currentDB[type].map(item => item.id === data.id ? { ...item, ...data } : item);
    } else if (action === 'delete') {
        currentDB[type] = currentDB[type].filter(item => item.id !== data.id);
    }

    writeDB(currentDB);
    
    // Broadcast updated list to ALL clients (including sender) to ensure sync
    io.emit('sync_' + type, currentDB[type]);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
  console.log(`Local Database: ${DB_FILE}`);
});
