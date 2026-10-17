import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { getUser, requireAuth } from "void/auth";
import { z } from "zod";
import { findArticleBySlug, listArticles } from "#domains/articles/queries";
import { setFavorite } from "#domains/favorites/commands";
import { getFavoriteStates } from "#domains/favorites/queries";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  const rows = await listArticles();
  const favorites = await getFavoriteStates(rows.map((row) => row.id), getUser()?.id ?? null);
  return { articles: rows.map((row) => ({ ...row, favorite: favorites.get(row.id)! })) };
});

export const actions = {
  favorite: defineHandler.withValidator({
    body: z.object({ slug: z.string(), favorite: z.boolean() }),
  })(async (c, { body }) => {
    const user = requireAuth(c);
    const article = await findArticleBySlug(body.slug);
    if (!article) throw new HTTPException(404, { message: "記事が見つかりません" });
    await setFavorite(user.id, article.id, body.favorite);
  }),
};
