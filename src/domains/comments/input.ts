import { comments } from "@schema";
import { createInsertSchema, createSelectSchema } from "void/drizzle-zod";

// コメントの投稿で受け取る項目と、その検証ルール
export const commentInput = createInsertSchema(comments, {
  body: (s) => s.trim().min(1).max(1000),
}).pick({ body: true });

// コメントの削除で受け取る項目
export const commentRef = createSelectSchema(comments).pick({ id: true });
