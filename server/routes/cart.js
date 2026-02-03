const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('./auth');

// 查询购物车数据（需JWT认证）
router.get('/cart', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.account_id,
        c.product_id,
        c.amount,
        c.total_price,
        p.name,
        p.price 
      FROM cart c
      LEFT JOIN products p ON c.product_id = p.id
      WHERE c.account_id = ?
    `, [userId]);
    
    res.json({
      success: true,
      message: '查询购物车成功！',
      data: rows
    });
    
    console.log('查询结果:', rows);
  } catch (error) {
    console.log('服务器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 删除购物车（需JWT认证）
router.delete('/cart/:itemId', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const itemId = req.params.itemId;
  
  try {
    // 检查购物车项目是否属于该用户
    const [checkResult] = await pool.query(
      'SELECT id FROM cart WHERE id = ? AND account_id = ?',
      [itemId, userId]
    );

    if (checkResult.length === 0) {
      return res.status(403).json({
        success: false,
        message: '无权操作此购物车项目或项目不存在'
      });
    }

    await pool.execute(`
      delete from cart where id = ?
    `, [itemId]);
    
    res.json({
      success: true,
      message: '商品已删除'
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 添加购物车商品（需JWT认证）
router.post('/cart/add', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, amount, totalPrice } = req.body;

    if (!productId || !amount || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: productId, amount 或 totalPrice'
      });
    }

    await pool.execute(
      `INSERT INTO cart (account_id, product_id, amount, total_price)
       VALUES (?, ?, ?, ?)`,
      [userId, productId, amount, totalPrice]
    );

    res.json({
      success: true,
      message: '加入购物车成功！'
    });
  } catch (error) {
    console.error('添加购物车失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，添加购物车失败'
    });
  }
});

module.exports = router;
