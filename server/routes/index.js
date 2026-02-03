const express = require('express');
const router = express.Router();

// 导入各个路由模块 
const aiRoutes = require('./ai1');
const authRoutes = require('./auth');
const productRoutes = require('./product');
const orderRoutes = require('./orders');
const cartRoutes = require('./cart');

router.use(aiRoutes);
router.use(authRoutes);
router.use(productRoutes);
router.use(orderRoutes);
router.use(cartRoutes);

module.exports = router;
