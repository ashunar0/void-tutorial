import { articles } from "@schema";
import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { getUser, requireAuth } from "void/auth";
import { createSelectSchema } from "void/drizzle-zod";
import { deleteArticle } from "#domains/articles/commands";
import { canEdit } from "#domains/articles/policy";
import { findArticleBySlug } from "#domains/articles/queries";
import { getFavoriteState } from "#domains/favorites/queries";

const params = createSelectSchema(articles).pick({ slug: true });

// withValidator 付きの loader は戻り値の Promise がほどかれない（Void 1.1.11 の型の穴）ので Awaited を足す
export type Props = Awaited<InferProps<typeof loader>>;

export const loader = defineHandler.withValidator({ params })(async (_c, { params }) => {
  const article = await findArticleOr404(params.slug);
  const viewerId = getUser()?.id ?? null;
  const favorite = await getFavoriteState(article.id, viewerId);
  return { article, favorite, canEdit: canEdit(article, viewerId) };
});

// 削除のボタンはこの画面にしか出ないので、API ではなくこの画面の action にする
export const action = defineHandler.withValidator({ params })(async (c, { params }) => {
  const user = requireAuth(c);
  const article = await findArticleOr404(params.slug);
  if (!canEdit(article, user.id)) throw new HTTPException(403, { message: "この記事は削除できません" });
  await deleteArticle(article.id);
  return c.redirect("/");
});

async function findArticleOr404(slug: string) {
  const article = await findArticleBySlug(slug);
  if (!article) throw new HTTPException(404, { message: "記事が見つかりません" });
  return article;
}
