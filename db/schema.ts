import { sql } from "void/db";
import { index, integer, primaryKey, sqliteTable, text } from "void/schema-d1";
import { users } from "#domains/users/table";

export const articles = sqliteTable(
  "articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    body: text("body").notNull(),
    authorId: text("author_id").notNull().references(() => users.id),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
    updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_articles_created").on(table.createdAt),
    index("idx_articles_author").on(table.authorId, table.createdAt),
  ],
);

export const favorites = sqliteTable(
  "favorites",
  {
    userId: text("user_id").notNull().references(() => users.id),
    articleId: integer("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.articleId] }),
    index("idx_favorites_article").on(table.articleId),
  ],
);

export const comments = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    articleId: integer("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
    authorId: text("author_id").notNull().references(() => users.id),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [index("idx_comments_article").on(table.articleId, table.createdAt)],
);
