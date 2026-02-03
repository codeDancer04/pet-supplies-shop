const mysql = require('mysql2/promise'); // 使用promise版本

const pool = mysql.createPool({
  host: '8.134.193.247',  //服务器ip地址
  user: 'root', // 用户名
  password: 'wrUaqDqHeR8F473', // 密码
  database: 'dog_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;