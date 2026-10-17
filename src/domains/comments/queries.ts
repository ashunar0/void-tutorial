import { comments } from "@schema";
import { db, desc, eq } from "void/db";
import { users } from "#domains/users/table";

// 新しい順。書き手はユーザー名だけを出し、メールアドレスは選ばない
export function listComments(articleId: number) {
  return db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorName: users.name,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorId))
    .where(eq(comments.articleId, articleId))
    .orderBy(desc(comments.createdAt), desc(comments.id));
}

export async function findComment(commentId: number) {
  const [comment] = await db.select().from(comments).where(eq(comments.id, commentId));
  return comment ?? null;
}
