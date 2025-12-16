import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  throw new Error("Faltan variables de entorno en el archivo .env");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: (process.env.DB_PASS as string) ?? "",
  database: process.env.DB_NAME as string,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool.promise();
