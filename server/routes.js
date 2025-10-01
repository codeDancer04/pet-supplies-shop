// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const redisClient = require('./redis');

router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(400).json({ message: '未提供Token' });
  }

  try {
    // 将Token加入黑名单（剩余有效期）
    const decoded = jwt.decode(token);
    const expiresAt = decoded.exp * 1000; // 过期时间戳
    const ttl = Math.max(0, expiresAt - Date.now()); // 剩余毫秒数

    await redisClient.set(`bl_${token}`, 'invalid', { PX: ttl });

    res.json({ success: true, message: '退出成功' });
  } catch (error) {
    console.error('退出失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;