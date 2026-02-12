const mysql = require('mysql2/promise'); // 使用promise版本

const pool = mysql.createPool({
  host: 'localhost',  //服务器ip地址
  user: 'root', // 用户名
  // password: 'wrUaqDqHeR8F473', // 密码
  password:"100656",
  database: 'dog_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;