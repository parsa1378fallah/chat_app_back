const {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
} = require("drizzle-orm/mysql-core");
const { users } = require("./user");

const groups = mysqlTable("groups", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

module.exports = { groups };
