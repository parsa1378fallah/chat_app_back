const {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
} = require("drizzle-orm/mysql-core");
const { users } = require("./user");
const { channels } = require("./channel");

const channelMembers = mysqlTable("channel_members", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  channelId: bigint("channel_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => channels.id),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 20 }).default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

module.exports = { channelMembers };
