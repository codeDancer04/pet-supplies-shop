const pool = require('../db');

// 统一生成带 statusCode 的错误对象，方便上层根据 HTTP 状态码返回给前端。
const makeError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// 限制查询条数，在 1-50 之间
const clampLimit = (limit) => Math.min(Math.max(limit ?? 20, 1), 50);

// 查询数据库工具函数
const queryDb = async (input, ctx) => {
  // 限制查询条数
  const limit = clampLimit(input?.limit);
  // 如果查询商品，没有分类，返回所有商品
  if (input?.resource === 'products' && !input?.category) { 
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

    // 返回的是全部商品列表：给智能体展示“一共有哪些商品/价格/库存/图片”
    const [rows] = await pool.query(sql, [limit]);
    return { 
      message: '查询到全部商品列表',
      resource: 'products', 
      rows 
    };
  }
  // 如果查询商品，有分类，返回该分类商品
  if (input?.resource === 'products' && input?.category) {
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
      WHERE p.class = ?
      ORDER BY p.id DESC
      LIMIT ?
    `;
    // 返回的是该分类商品列表：给智能体展示“有哪些商品/价格/库存/图片”
    const [rows] = await pool.query(sql, [input.category, limit]);
    return { 
      message: '查询到' + input.category + '分类商品列表',
      resource: 'products', 
      rows 
    };
  }

  // 如果查询用户信息
  if (input?.resource === 'user') {
    // 检查用户登录状态
    if (!ctx?.userId) throw makeError('需要登录后才能查询用户信息（userId 缺失）', 401);
    const sql = `
      SELECT id, name, avatar_url
      FROM accounts
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [ctx.userId]);
    return { 
      message: '查询到用户信息',
      resource: 'user', 
      rows 
    };
  }

  // 订单查询
  if (input?.resource === 'orders') {
    // 订单属于敏感数据：必须登录，且只能查自己的订单
    if (!ctx?.userId) throw makeError('需要登录后才能查询订单（userId 缺失）', 401);
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
    return { 
      message: '查询到用户订单列表',
      resource: 'orders', 
      rows 
    };
  }

  throw makeError('不支持的 resource: ' + input?.resource, 400);
};

// 创建订单工具函数
const createOrder = async (input, ctx) => {

  // 检查用户登录状态
  if (!ctx?.userId) throw makeError('需要登录后才能下单（userId 缺失）', 401);
  const amount = Number(input?.amount);
  //如果有productId，就直接根据productId创建订单
  if(input?.productId){
    const productId = Number(input?.productId);

  if (!Number.isFinite(productId) || productId <= 0) throw makeError('productId 不合法', 400);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 99) throw makeError('amount 不合法', 400);
  
  // 查询商品的信息，目的是为了获取单价与库存
  const [productRows] = await pool.query(
    `SELECT id, price, stock FROM products WHERE id = ? LIMIT 1`, 
    [productId]
  );
  
  if (!productRows || productRows.length === 0) throw makeError('商品不存在', 404);
  const stock = Number(productRows[0].stock);
  if (Number.isFinite(stock) && stock < amount) throw makeError('库存不足', 409);

  //拿到单价
  const unitPrice = Number(productRows[0].price);
  // 计算总价：用单价*数量
  const price = unitPrice * amount;
  if (!Number.isFinite(price) || price <= 0) throw makeError('price 不合法', 400);

  const [result] = await pool.execute(
  // 写入 orders 表生成订单（status 初始为“未完成”，现有 /buy 路由一致）
    `
      INSERT INTO orders(account_id, date, status, product_id, amount, price)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [ctx.userId, new Date().toISOString().slice(0, 19).replace('T', ' '), '未完成', productId, amount, price]
  );

  return { 
    message: '订单创建成功',
    orderId: result.insertId
   };

  }else if(input?.productName){ //如果没有productId但是有productName，就使用productName查询商品id，然后创建订单
    const productName = input?.productName?.trim();
    // 使用productName查询商品id
    const [productRows] = await pool.query(
      `SELECT id FROM products WHERE name = ? LIMIT 1`, 
      [productName]
    );

    if (!productRows || productRows.length === 0) {
      //没有匹配到名称，说明用户输入有误，此时查找全部商品
      const [allProductRows] = await pool.query(
        `SELECT id, name FROM products`
      );
      //返回全部商品信息，让大模型引导用户输入正确的商品名称
      return { 
        message: '用户输入的商品名称可能有误，请引导用户输入正确的商品名称。这是全部商品信息：', 
        userInput: productName,
        allProductRows: allProductRows
      };
    };
    // 拿到商品id
    const productId = Number(productRows[0].id);
    // 创建订单
    return await createOrder({productId, amount}, ctx);
  }
 
};

module.exports = { queryDb, createOrder };
