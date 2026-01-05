
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 在 AI Studio 预览环境中，通常不需要在这里显式 import CSS 
// 样式由 index.html 中的 Tailwind CDN 处理

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
