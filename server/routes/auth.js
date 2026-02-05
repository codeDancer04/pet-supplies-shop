const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'my-256-bit-secret';
const TOKEN_EXPIRES = '24h';

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'img'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// JWT验证中间件
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT验证失败:', err.message);
        return res.status(403).json({ 
          success: false,
          message: 'Token已过期或无效'
        });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({
      success: false,
      message: '未提供认证Token'
    });
  }
};

// 注册路由
router.post('/signup', upload.single('avatar'), async (req, res) => {
  const { phone_number, password, name } = req.body;
  const avatarFile = req.file;

  if (!phone_number || !password || !name) {
    return res.status(400).json({
      success: false,
      message: '手机号、密码和昵称为必填项'
    });
  }

  try {
    const [existingUsers] = await pool.query(
      `select id from accounts where phone_number = ? limit 1`,
      [phone_number]
    );
    
    if(existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: '该手机号已被注册'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO accounts 
       (phone_number, password, name, avatar_url) 
       VALUES (?, ?, ?, ?)`,
      [
        phone_number,
        password,
        name,
        avatarFile ? avatarFile.filename : null
      ]
    );

    res.status(201).json({
      success: true,
      message: '账号创建成功',
      data: {
        accountId: result.insertId
      }
    });
  } catch (error) {
    console.error('数据库错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 登录路由
router.post('/login', async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, phone_number, name, avatar_url FROM accounts WHERE phone_number = ? AND password = ? LIMIT 1`,
      [req.body.phone_number, req.body.password]
    );
    
    if(users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误！'
      });
    }

    const user = users[0];
    const token = jwt.sign(
      { 
        userId: user.id,
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES }
    );

    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        id: user.id,
        phone_number: user.phone_number,
        name: user.name,
        avatar_url: user.avatar_url,
        token: token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取用户信息路由
router.get('/userinfo', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.query(
      `SELECT a.name, a.avatar_url, a.phone_number, u.address 
       FROM accounts a 
       LEFT JOIN userinfo u ON a.id = u.account_id 
       WHERE a.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      console.log(`用户不存在，用户ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const user = users[0];
    res.json({
      success: true,
      data: {
        name: user.name,
        avatarUrl: user.avatar_url,
        phoneNumber: user.phone_number,
        address: user.address
      }
    });
  } catch (error) {
    console.error('[GET_USER_ERROR]', error);
    if (error.code) {
      console.error('数据库错误代码:', error.code);
    }
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 更新用户信息路由
router.put('/userinfo', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, address } = req.body;

    // 更新 accounts 表 (如果有 name)
    if (name !== undefined) {
      await pool.execute(
        'UPDATE accounts SET name = ? WHERE id = ?',
        [name, userId]
      );
    }

    // 更新 userinfo 表 (如果有 address)
    if (address !== undefined) {
      // 检查 userinfo 是否存在记录
      const [rows] = await pool.query(
        'SELECT id FROM userinfo WHERE account_id = ?',
        [userId]
      );

      if (rows.length > 0) {
        // 更新
        await pool.execute(
          'UPDATE userinfo SET address = ? WHERE account_id = ?',
          [address, userId]
        );
      } else {
        // 插入
        await pool.execute(
          'INSERT INTO userinfo (account_id, address) VALUES (?, ?)',
          [userId, address]
        );
      }
    }

    res.json({
      success: true,
      message: '用户信息更新成功'
    });

  } catch (error) {
    console.error('[UPDATE_USER_ERROR]', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 退出登录路由
router.post('/logout', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: '退出成功' 
  });
});

module.exports = router;
module.exports.authenticateJWT = authenticateJWT;
