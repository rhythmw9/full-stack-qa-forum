// MySQL connection pool 

import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";


const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_CA_CERT_PATH,
} = process.env;

// Load CA from file if provided 
let ssl;
if (DB_CA_CERT_PATH) {
  const caPath = path.resolve(process.cwd(), DB_CA_CERT_PATH);
  const ca = fs.readFileSync(caPath, "utf8");
  ssl = { ca };
}

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
  ssl, 
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
