const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test and retry database connection
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log("✅ Database connection established successfully");
      await connection.query("SELECT 1");
      connection.release();
      return;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, {
        message: error.message,
        code: error.code,
      });
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.error("❌ Failed to connect to database after retries");
  process.exit(1);
};

connectWithRetry();

module.exports = pool;