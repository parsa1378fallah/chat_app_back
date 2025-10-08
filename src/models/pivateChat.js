const { mysqlTable, bigint, timestamp } = require("drizzle-orm/mysql-core");
const { users } = require("./user");

const privateChats = mysqlTable("private_chats", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  user1Id: bigint("user1_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  user2Id: bigint("user2_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

module.exports = { privateChats };
