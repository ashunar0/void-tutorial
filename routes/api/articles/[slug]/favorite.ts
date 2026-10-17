import { articles } from "@schema";
import { HTTPException } from "hono/http-exception";
import { defineHandler } from "void";
import { requireAuth } from "void/auth";
import { createSelectSchema } from "void/drizzle-zod";
import { findArticleBySlug } from "#domains/articles/queries";
import { setFavorite } from "#domains/favorites/commands";

// PUT でいいね、DELETE で取り消し。どちらも二度送っても結果は同じ
const params = createSelectSchema(articles).pick({ slug: true });

export const PUT = defineHandler.withValidator({ params })(async (c, { params }) => {
  const user = requireAuth(c);
  await setFavorite(user.id, await findArticleIdOr404(params.slug), true);
  return c.body(null, 204);
});

export const DELETE = defineHandler.withValidator({ params })(async (c, { params }) => {
  const user = requireAuth(c);
  await setFavorite(user.id, await findArticleIdOr404(params.slug), false);
  return c.body(null, 204);
});

async function findArticleIdOr404(slug: string): Promise<number> {
  const article = await findArticleBySlug(slug);
  if (!article) throw new HTTPException(404, { message: "記事が見つかりません" });
  return article.id;
}
