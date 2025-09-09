// MySQL connection pool 

import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";


const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true, 
  timezone: "Z",           
});


export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Self-test on import
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("MySQL pool ready");
  } catch (err) {
    console.error("MySQL connection failed:", err.message);
  }
})();
