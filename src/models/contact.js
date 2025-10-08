const { mysqlTable, bigint, timestamp } = require("drizzle-orm/mysql-core");
const { users } = require("./user");

const contacts = mysqlTable("contacts", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  userId: bigint("user_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  contactId: bigint("contact_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

module.exports = { contacts };
