const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateJWT } = require('./auth');

// 获取订单信息（需JWT认证）
router.get('/orders', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [orders] = await pool.query(`
      select 
      o.id,
      o.date,
      o.status,
      o.amount,
      o.price,
      p.name 
      from orders o
      left join products p
      on o.product_id = p.id
      where o.account_id = ?`,
      [userId]);
      
      console.log('SQL查询结果:', orders);
      
      res.json({
        success: true,
        message: '查询订单成功！',
        data: orders
      });
    } catch (err) {
      console.error('API错误:', err);
      res.status(500).json({ 
        success: false,
        message: '服务器错误'
      });
    }
});

// 删除订单信息（需JWT认证）
router.delete('/orders/:orderId', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.orderId;

    // 检查订单是否属于该用户
    const [checkResult] = await pool.query(
      'SELECT id FROM orders WHERE id = ? AND account_id = ?',
      [orderId, userId]
    );

    if (checkResult.length === 0) {
      return res.status(403).json({
        success: false,
        message: '无权操作此订单或订单不存在'
      });
    }

    await pool.query('DELETE FROM orders WHERE id = ?', [orderId]);
    res.json({
      success: true,
      message: '订单已取消'
    });
  } catch (err) {
    console.error('取消订单失败:', err);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 购物生成订单（需JWT认证）
router.post('/buy', authenticateJWT, async (req, res) => {
  try {
    const { productId, amount, price } = req.body;
    console.log(req.body);
    const userId = req.user.userId;
    
    const [result] = await pool.execute(`
      insert into orders(account_id, date, status, product_id, amount, price)
      values (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        new Date().toISOString().slice(0, 19).replace('T', ' '),
        '未完成',
        productId,
        amount,
        price
      ]
    );
    
    res.json({
      success: true,
      message: '购买成功，生成订单数据',
      data: result.insertId
    });
  } catch (error) {
    console.error('订单创建失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;
