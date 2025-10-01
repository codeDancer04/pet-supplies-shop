const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');
const multer = require('multer');
const PORT = 3000;
const app = express();
const jwt = require('jsonwebtoken'); // 新增：引入JWT库
// 托管前端静态文件
app.use(express.static(path.join(__dirname, 'client/dist')));
// 提供静态资源服务
app.use('/img', express.static('server/img'));

const JWT_SECRET = 'my-256-bit-secret';
const TOKEN_EXPIRES = '24h'; // Token过期时间

app.use(express.json());//自动将JSON请求体转换为JavaScript对象，解析结果存储在req.body中
app.use(cors());// 默认配置允许所有跨域请求
app.use('/img', express.static(path.join(__dirname, 'img')));

// 配置multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/img/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 新增：JWT验证中间件
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT验证失败:', err.message); // 添加详细错误日志
        return res.status(403).json({ 
          success: false,
          message: 'Token已过期或无效'
        });
      }
      
      console.log('JWT验证成功，用户ID:', user.userId); // 记录验证成功的用户ID
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

// 所有未处理的请求返回前端入口文件（支持 React Router）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// 接收注册信息
app.post('/api/signup',upload.single('avatar'), async (req, res) => {
  // 文本字段从 req.body 获取
  const { phone_number, password, name } = req.body;

  // 文件字段从 req.file 获取
  const avatarFile = req.file;

  // 必填字段验证
  if (!phone_number || !password || !name) {
    return res.status(400).json({
      success:false,
      message:'手机号、密码和昵称为必填项'
    });
  }

  try {

    const [existingUsers] = await pool.query(
      `select id from accounts where phone_number = ? limit 1`,
      [phone_number]
    );
    if(existingUsers.length>0){
      return res.status(409).json({
        success:false,
        message:'该手机号已被注册'
      })
    }

    // 执行SQL插入
    const [result] = await pool.execute(
      `INSERT INTO accounts 
       (phone_number, password, name, avatar_url) 
       VALUES (?, ?, ?, ?)`,
      [
        phone_number,
        password,
        name,
        avatarFile ? `${avatarFile.originalname}` : null
      ]
    );

    res.status(201).json({
      success:true,
      message: '账号创建成功',
      data:{
        accountId: result.insertId
      }
      
    });
  } catch (error) {
    console.error('数据库错误:', error);
    
    res.status(500).json({
        success:false,
        message:'服务器错误'
      });
  }
});

//接收登录数据
app.post('/api/login', async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, phone_number, name, avatar_url FROM accounts WHERE phone_number = ? AND password = ? LIMIT 1`,
      [req.body.phone_number, req.body.password]
    );
    
    if(users.length === 0){
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误！'
      });
    }

    const user = users[0];

    // 签发JWT（不包含敏感信息）
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
        token:token
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message:'服务器错误'
    });
  }
});

//获取商品信息
app.get('/api/products', async (req, res) => {
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
      data: products // 返回实际查询结果
    });

  } catch (error) {
    console.error('数据库查询失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

//获取轮播图信息
app.get('/api/carousel',async (req,res) => {
  res.json({
    success:true,
    message:'获取轮播图信息成功！',
    data:[
      'http://localhost:3000/img/carousel1.jpg',
      'http://localhost:3000/img/carousel2.jpg',
      'http://localhost:3000/img/carousel3.jpg',
      'http://localhost:3000/img/carousel4.jpg'
      ] 
  });
})

// 获取用户信息（需JWT认证）
app.get('/api/userinfo', authenticateJWT, async (req, res) => {
  try {
    // 1. 从已验证的Token中获取用户ID
    const userId = req.user.userId;
    console.log(`请求用户信息，用户ID: ${userId}`);

    // 2. 查询数据库
    const [users] = await pool.query(
      `SELECT name, avatar_url FROM accounts WHERE id = ?`,
      [userId]
    );

    // 3. 验证查询结果
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
      }
    });

  } catch (error) {
    console.error('[GET_USER_ERROR]', error);
    // 如果是数据库错误，输出SQL错误信息
    if (error.code) {
      console.error('数据库错误代码:', error.code);
    }
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

app.post('api/logout', (req, res) => {
  // 前端需清除本地Token
  res.status(200).json({ 
    success: true,
    message: '退出成功' 
  });
});

//获取订单信息（需JWT认证）
app.get('/api/orders',authenticateJWT, async (req,res) => {

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
      where o.account_id = ? `,
      [userId]);
      console.log(`请求用户信息，用户ID: ${userId}`);
      console.log('SQL查询结果:', orders); // 调试输出
      res.json({
        success:true,
        message:'查询订单成功！',
        data:orders
      });
    } catch (err) {
      console.error('API错误:', err);
      res.status(500).json({ 
      success: false,
      message: '服务器错误'
    });
    };
})

//删除订单信息（需JWT认证）
app.delete('/api/orders/:orderId',authenticateJWT,async (req,res) => {
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
      success:true,
      message:'订单已取消'
    });
  } catch (err) {
    console.error('取消订单失败:', err);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }

})

//购物生成订单（需JWT认证）
app.post('/api/buy',authenticateJWT,async (req,res) => {
  try {
    const { productId, amount, price } = req.body;
    console.log(req.body);
    const userId = req.user.userId;
    const [result] = await pool.execute(`
      insert into orders(account_id,date,status,product_id,amount,price)
      values (?,?,?,?,?,?)
      `,[userId,
      new Date().toISOString().slice(0, 19).replace('T', ' '),
    '未完成',
      productId,
      amount,
      price]
  );
  res.json({
    success:true,
    message:'购买成功，生成订单数据',
    data:result.insertId
  })
  } catch (error) {
    console.error('订单创建失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
})

// 查询购物车数据（需JWT认证）
app.get('/api/cart', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // 使用 await 等待查询结果
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
    
    // 直接返回查询结果（数组）
    res.json({
      success: true,
      message: '查询购物车成功！',
      data: rows // 直接返回查询结果数组
    });
    
    console.log('查询结果:', rows); // 修改日志输出
    
  } catch (error) {
    console.log('服务器错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

//删除购物车（需JWT认证）
app.delete('/api/cart/:itemId',authenticateJWT,async (req,res) => {
  const userId = req.user.userId;
  const itemId = req.params.itemId;
  
  try {

    // 检查订单是否属于该用户
    const [checkResult] = await pool.query(
      'SELECT id FROM cart WHERE id = ? AND account_id = ?',
      [itemId, userId]
    );

    if (checkResult.length === 0) {
      return res.status(403).json({
        success: false,
        message: '无权操作此订单或订单不存在'
      });
    }

    await pool.execute(`
    delete from cart where id = ?
    `,[itemId]);
    res.json({
      success:true,
      message:'商品已删除'
    })
  } catch (error) {
    console.log(error);
  }
});

// 使用 POST 方法添加购物车商品
app.post('/api/cart/add', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, amount, totalPrice } = req.body; // 从请求体中获取数据

    // 验证输入数据
    if (!productId || !amount || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数: productId, amount 或 totalPrice'
      });
    }

    // 使用参数化查询防止SQL注入
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

app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});
