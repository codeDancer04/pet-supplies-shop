const express = require('express');
const cors = require('cors');
const path = require('path');
const PORT = 3000;
const app = express();

// 引入路由模块
const routes = require('./routes');

// 提供静态资源服务
app.use('/img', express.static(path.join(__dirname, 'img')));

// 中间件配置
app.use(express.json());
app.use(cors());

// 使用路由模块
app.use('/api', routes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('路由错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});