const {
  mysqlTable,
  bigint,
  varchar,
  text,
  boolean,
  timestamp,
} = require("drizzle-orm/mysql-core");

const users = mysqlTable("users", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  phone: varchar("phone", { length: 15 }).notNull().unique(),
  username: varchar("username", { length: 50 }).unique(),
  displayName: varchar("display_name", { length: 100 }),
  bio: text("bio"),
  profileImage: varchar("profile_image", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  refreshToken: varchar("refresh_token", { length: 512 }),
  isActive: boolean("is_active").default(true),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

module.exports = { users };
