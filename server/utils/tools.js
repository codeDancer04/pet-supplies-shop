const pool = require('../db');

// 统一生成带 statusCode 的错误对象，方便上层根据 HTTP 状态码返回给前端。
const makeError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/**
 * 限制查询条数，防止一次返回太多数据导致性能问题或信息泄露。
 */
const clampLimit = (limit) => Math.min(Math.max(limit ?? 20, 1), 50);

const queryDb = async (input, ctx) => {
  // 限制查询条数
  const limit = clampLimit(input?.limit);
  if (input?.resource === 'products') {
    const sql = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.stock,
        p.class,
        pi.img_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      ORDER BY p.id DESC
      LIMIT ?
    `;

    // 返回的是商品列表：给智能体展示“有哪些商品/价格/库存/图片”
    const [rows] = await pool.query(sql, [limit]);
    return { resource: 'products', rows };
  }

  if (input?.resource === 'user') {
    if (!ctx?.userId) throw makeError('需要登录后才能查询用户信息', 401);
    const sql = `
      SELECT id, name, avatar_url
      FROM accounts
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [ctx.userId]);
    return { resource: 'user', rows };
  }

  // 订单查询
  if (input?.resource === 'orders') {
    // 订单属于敏感数据：必须登录，且只能查自己的订单
    if (!ctx?.userId) throw makeError('需要登录后才能查询订单', 401);
    // 构建 SQL 查询语句：只返回当前用户的订单
    const sql = `
      SELECT 
        o.id,
        o.date,
        o.status,
        o.amount,
        o.price,
        p.name
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.account_id = ?
      ORDER BY o.date DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [ctx.userId, limit]);
    return { resource: 'orders', rows };
  }

  throw makeError('不支持的 resource: ' + input?.resource, 400);
};

const createOrder = async (input, ctx) => {

  if (!ctx?.userId) throw makeError('需要登录后才能下单', 401);

  const productId = Number(input?.productId);
  const amount = Number(input?.amount);

  if (!Number.isFinite(productId) || productId <= 0) throw makeError('productId 不合法', 400);
  // 基础入参校验
  if (!Number.isFinite(amount) || amount <= 0 || amount > 99) throw makeError('amount 不合法', 400);

  const [productRows] = await pool.query(`SELECT id, price, stock FROM products WHERE id = ? LIMIT 1`, [productId]);
  // 查询商品，拿到单价与库存
  if (!productRows || productRows.length === 0) throw makeError('商品不存在', 404);

  const stock = Number(productRows[0].stock);
  if (Number.isFinite(stock) && stock < amount) throw makeError('库存不足', 409);

  const unitPrice = Number(productRows[0].price);
  // 计算总价：优先使用 input.price（如果是合法数字），否则用单价*数量
  const price = Number.isFinite(Number(input?.price)) ? Number(input.price) : unitPrice * amount;
  if (!Number.isFinite(price) || price <= 0) throw makeError('price 不合法', 400);

  const [result] = await pool.execute(
  // 写入 orders 表生成订单（status 初始为“未完成”，现有 /buy 路由一致）
    `
      INSERT INTO orders(account_id, date, status, product_id, amount, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [ctx.userId, new Date().toISOString().slice(0, 19).replace('T', ' '), '未完成', productId, amount, price]
  );

  return { orderId: result.insertId };
};

module.exports = { queryDb, createOrder };
