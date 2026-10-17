import { sql } from "void/db";
import { index, integer, sqliteTable, text } from "void/schema-d1";
import { userTable } from "../.void/better-auth-schema";

export const articles = sqliteTable(
  "articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    body: text("body").notNull(),
    authorId: text("author_id").notNull().references(() => userTable.id),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_articles_created").on(table.createdAt),
    index("idx_articles_author").on(table.authorId, table.createdAt),
  ],
);
