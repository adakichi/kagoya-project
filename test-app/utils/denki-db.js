import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DENKI_DB_HOST,
  user: process.env.DENKI_DB_USER,
  password: process.env.DENKI_DB_PASSWORD,
  database: process.env.DENKI_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
