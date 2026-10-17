import { articles } from "@schema";
import { createInsertSchema } from "void/drizzle-zod";

// 記事の作成と編集で受け取る項目と、その検証ルール
export const articleInput = createInsertSchema(articles, {
  title: (s) => s.trim().min(1).max(200),
  description: (s) => s.trim().min(1).max(500),
  body: (s) => s.trim().min(1),
}).pick({ title: true, description: true, body: true });
