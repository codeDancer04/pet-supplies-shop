const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes/index');
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();
//跨域中间件
app.use(cors());
app.use(express.json());
// 静态文件中间件
app.use('/img', express.static(path.join(__dirname, 'img')));
// 挂载路由
app.use('/api', apiRouter);

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status =
    (err && typeof err === 'object' && typeof err.status === 'number' && err.status) ||
    (err && typeof err === 'object' && typeof err.statusCode === 'number' && err.statusCode) ||
    (err instanceof SyntaxError ? 400 : 500);

  const message = status === 400 ? '请求体 JSON 解析失败' : '服务器内部错误';
  const payload = { success: false, message };
  if (process.env.NODE_ENV !== 'production') {
    payload.details = err instanceof Error ? err.message : String(err);
  }
  res.status(status).json(payload);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
