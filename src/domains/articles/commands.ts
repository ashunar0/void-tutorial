import { articles } from "@schema";
import { db, eq, sql } from "void/db";

type ArticleInput = { title: string; description: string; body: string };

export async function createArticle(input: ArticleInput & { authorId: string }): Promise<{ slug: string }> {
  const slug = toSlug(input.title);
  await db.insert(articles).values({ ...input, slug });
  return { slug };
}

// タイトルを直しても slug は変えない。URL が変わると外から貼られたリンクが切れるので
export async function updateArticle(articleId: number, input: ArticleInput): Promise<void> {
  await db
    .update(articles)
    .set({ ...input, updatedAt: sql`(datetime('now'))` })
    .where(eq(articles.id, articleId));
}

// いいね（とこの先のコメント・タグ付け）は外部キーの ON DELETE CASCADE で一緒に消える
export async function deleteArticle(articleId: number): Promise<void> {
  await db.delete(articles).where(eq(articles.id, articleId));
}

// タイトルの英数字部分 + ランダムな6文字。日本語だけのタイトルならランダムな6文字だけになる
function toSlug(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6);
  return base ? `${base}-${suffix}` : suffix;
}
