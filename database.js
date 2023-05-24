require('dotenv').config;
const mysql = require('mysql2');

// SQL Placeholder, nanti bisa diganti pakai CloudSQL
const pool = mysql.createPool({
  host: process.env.dbhost,
  user: process.env.dbuser,
  database: process.env.dbdatabase, 
  password: process.env.dbpassword,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
