const mysql = require('mysql2/promise'); // 使用promise版本

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // 你的MySQL用户名
  password: '100656', // 你的MySQL密码
  database: 'dog_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;