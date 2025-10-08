const {
  mysqlTable,
  bigint,
  varchar,
  timestamp,
} = require("drizzle-orm/mysql-core");
const { users } = require("./user");
const { groups } = require("./group");

const groupMembers = mysqlTable("group_members", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  groupId: bigint("group_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => groups.id),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 20 }).default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

module.exports = { groupMembers };
