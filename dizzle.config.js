/** @type { import("drizzle-kit").Config } */
module.exports = {
  schema: "./db/schema.js",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "chat_app",
  },
};
