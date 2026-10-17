import { articles } from "@schema";
import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { getUser, requireAuth } from "void/auth";
import { createSelectSchema } from "void/drizzle-zod";
import { z } from "zod";
import { findArticleBySlug } from "#domains/articles/queries";
import { setFavorite } from "#domains/favorites/commands";
import { getFavoriteState } from "#domains/favorites/queries";

const params = createSelectSchema(articles).pick({ slug: true });

// withValidator 付きの loader は戻り値の Promise がほどかれない（Void 1.1.11 の型の穴）ので Awaited を足す
export type Props = Awaited<InferProps<typeof loader>>;

export const loader = defineHandler.withValidator({ params })(async (_c, { params }) => {
  const article = await findArticleBySlug(params.slug);
  if (!article) throw new HTTPException(404, { message: "記事が見つかりません" });
  const favorite = await getFavoriteState(article.id, getUser()?.id ?? null);
  return { article, favorite };
});

export const actions = {
  favorite: defineHandler.withValidator({
    params,
    body: z.object({ favorite: z.boolean() }),
  })(async (c, { params, body }) => {
    const user = requireAuth(c);
    const article = await findArticleBySlug(params.slug);
    if (!article) throw new HTTPException(404, { message: "記事が見つかりません" });
    await setFavorite(user.id, article.id, body.favorite);
  }),
};
