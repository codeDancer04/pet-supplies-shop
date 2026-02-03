require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRouter = require('./routes/index');
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/img', express.static(path.join(__dirname, 'img')));

app.use('/api', apiRouter);

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
