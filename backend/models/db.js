const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connection established successfully");
    await connection.query("SELECT 1");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection error:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
    });
    process.exit(1);
  }
})();

module.exports = pool;