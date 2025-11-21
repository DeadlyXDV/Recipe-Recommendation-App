const mysql = require('mysql2');
require('dotenv').config();

// Membuat koneksi pool ke database MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recipe_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Menggunakan promise untuk query yang lebih mudah
const promisePool = pool.promise();

// Test koneksi database
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error koneksi database:', err.message);
    return;
  }
  console.log('Database MySQL terhubung');
  connection.release();
});

module.exports = promisePool;
