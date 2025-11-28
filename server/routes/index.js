const express = require('express');
const router = express.Router();

// 导入各个路由模块 
const authRoutes = require('./auth');
const productRoutes = require('./product'); // 修正为product而不是products
const orderRoutes = require('./orders');
const cartRoutes = require('./cart');

// 使用路由模块
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);

module.exports = router;