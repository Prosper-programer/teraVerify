const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'teraverify',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 as ok, DATABASE() as db');
    return { ok: true, database: rows[0].db };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  pool,
  checkConnection,
};
