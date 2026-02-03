const express = require('express');
const router = express.Router();
const pool = require('../db');

// 获取商品信息
router.get('/products', async (req, res) => {
  const { category } = req.query;

  try {
    const [products] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.price,
        p.stock,
        p.class,
        pi.img_url
       FROM products p
       LEFT JOIN product_images pi ON p.id = pi.product_id
       WHERE p.class = ?`,
      [category]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: '该分类下没有商品'
      });
    }

    res.json({
      success: true,
      message: '获取商品信息成功',
      data: products
    });

  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取轮播图信息
router.get('/carousel', async (req, res) => {
  res.json({
    success: true,
    message: '获取轮播图信息成功！',
    data: [
      'http://localhost:3000/img/carousel1.jpg',
      'http://localhost:3000/img/carousel2.jpg',
      'http://localhost:3000/img/carousel3.jpg',
      'http://localhost:3000/img/carousel4.jpg'
    ]
  });
});

module.exports = router;
