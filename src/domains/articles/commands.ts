import { articles } from "@schema";
import { db } from "void/db";

type NewArticle = { title: string; description: string; body: string; authorId: string };

export async function createArticle(input: NewArticle): Promise<{ slug: string }> {
  const slug = toSlug(input.title);
  await db.insert(articles).values({ ...input, slug });
  return { slug };
}

// タイトルの英数字部分 + ランダムな6文字。日本語だけのタイトルならランダムな6文字だけになる
function toSlug(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6);
  return base ? `${base}-${suffix}` : suffix;
}
