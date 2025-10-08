const {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
} = require("drizzle-orm/mysql-core");
const { users } = require("./user");

const messages = mysqlTable("messages", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  senderId: bigint("sender_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  chatType: varchar("chat_type", { length: 20 }).notNull(), // private, group, channel
  chatId: bigint("chat_id", { mode: "number", unsigned: true }).notNull(),
  content: text("content"),
  messageType: varchar("message_type", { length: 20 }).default("text"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

module.exports = { messages };
