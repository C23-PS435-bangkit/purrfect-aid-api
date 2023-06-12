require('dotenv').config;
const mysql = require('mysql2');

// SQL Placeholder, nanti bisa diganti pakai CloudSQL
const pool = mysql.createPool({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  database: process.env.DBDATABASE, 
  password: process.env.DBPASSWORD,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
