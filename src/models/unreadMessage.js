const {
  mysqlTable,
  bigint,
  boolean,
  timestamp,
} = require("drizzle-orm/mysql-core");
const { users } = require("./user");
const { messages } = require("./message");

const unreadMessages = mysqlTable("unread_messages", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  messageId: bigint("message_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => messages.id),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

module.exports = { unreadMessages };
