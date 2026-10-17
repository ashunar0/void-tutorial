import { comments } from "@schema";
import { db, eq } from "void/db";

export async function createComment(input: { articleId: number; authorId: string; body: string }): Promise<void> {
  await db.insert(comments).values(input);
}

export async function deleteComment(commentId: number): Promise<void> {
  await db.delete(comments).where(eq(comments.id, commentId));
}
