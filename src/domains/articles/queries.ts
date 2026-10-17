import { articles } from "@schema";
import { db, desc, eq } from "void/db";
import { users } from "#domains/users/table";

const PAGE_SIZE = 10;

// 一覧と詳細で共通の項目。書き手はユーザー名だけを出し、メールアドレスは選ばない
const summary = {
  slug: articles.slug,
  title: articles.title,
  description: articles.description,
  createdAt: articles.createdAt,
  authorName: users.name,
};
const byAuthor = eq(users.id, articles.authorId);

export function listArticles() {
  return db
    .select(summary)
    .from(articles)
    .innerJoin(users, byAuthor)
    .orderBy(desc(articles.createdAt), desc(articles.id))
    .limit(PAGE_SIZE);
}

export async function findArticleBySlug(slug: string) {
  const [article] = await db
    .select({ ...summary, body: articles.body })
    .from(articles)
    .innerJoin(users, byAuthor)
    .where(eq(articles.slug, slug));
  return article ?? null;
}
