const mysql = require('mysql2');

// SQL Placeholder, nanti bisa diganti pakai CloudSQL
const pool = mysql.createPool({
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12620347',
  password: 'GDKQFSyLXl',
  database: 'sql12620347',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
