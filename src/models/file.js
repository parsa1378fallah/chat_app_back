const {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
} = require("drizzle-orm/mysql-core");
const { users } = require("./user");

const files = mysqlTable("files", {
  id: bigint("id", { mode: "number", unsigned: true })
    .primaryKey()
    .autoincrement(),
  uploaderId: bigint("uploader_id", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  fileType: varchar("file_type", { length: 20 }).notNull(),
  filePath: varchar("file_path", { length: 255 }).notNull(),
  fileSize: bigint("file_size", { mode: "number", unsigned: true }),
  mimeType: varchar("mime_type", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

module.exports = { files };
