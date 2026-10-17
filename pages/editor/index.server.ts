import { articles } from "@schema";
import { defineHandler } from "void";
import { getUser, requireAuth } from "void/auth";
import { db } from "void/db";
import { createInsertSchema } from "void/drizzle-zod";

export const loader = defineHandler((c) => {
  if (!getUser()) return c.redirect("/login");
  return {};
});

export const action = defineHandler.withValidator({
  body: createInsertSchema(articles, {
    title: (s) => s.trim().min(1).max(200),
    description: (s) => s.trim().min(1).max(500),
    body: (s) => s.trim().min(1),
  }).pick({ title: true, description: true, body: true }),
})(async (c, { body }) => {
  const user = requireAuth(c);
  const slug = toSlug(body.title);
  await db.insert(articles).values({ ...body, slug, authorId: user.id });
  return c.redirect(`/article/${slug}`);
});

// タイトルの英数字部分 + ランダムな6文字。日本語だけのタイトルならランダムな6文字だけになる
function toSlug(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6);
  return base ? `${base}-${suffix}` : suffix;
}
