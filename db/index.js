require("dotenv").config();
const { drizzle } = require("drizzle-orm/mysql2");
const mysql = require("mysql2/promise");
const config = require("config");

const dbConfig = config.get("db");

const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
});

const db = drizzle(pool);

module.exports = db;
