const {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
} = require("drizzle-orm/mysql-core");
const { users } = require("./user");

const channels = mysqlTable("channels", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdBy: bigint("created_by", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

module.exports = { channels };
