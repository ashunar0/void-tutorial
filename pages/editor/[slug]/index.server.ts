import { articles } from "@schema";
import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { getUser, requireAuth } from "void/auth";
import { createSelectSchema } from "void/drizzle-zod";
import { updateArticle } from "#domains/articles/commands";
import { articleInput } from "#domains/articles/input";
import { canEdit } from "#domains/articles/policy";
import { findArticleBySlug } from "#domains/articles/queries";

const params = createSelectSchema(articles).pick({ slug: true });

// withValidator 付きの loader は、戻り値の Promise をほどかず、c.redirect の Response も型から外さない
// （Void 1.1.11 の型の穴。素の defineHandler は Exclude<Awaited<R>, Response> にしている）ので自分で外す
export type Props = Exclude<Awaited<InferProps<typeof loader>>, Response>;

export const loader = defineHandler.withValidator({ params })(async (c, { params }) => {
  const user = getUser();
  if (!user) return c.redirect("/login");
  const article = await findEditableArticle(params.slug, user.id);
  return { article: { slug: article.slug, title: article.title, description: article.description, body: article.body } };
});

export const action = defineHandler.withValidator({ params, body: articleInput })(async (c, { params, body }) => {
  const user = requireAuth(c);
  const article = await findEditableArticle(params.slug, user.id);
  await updateArticle(article.id, body);
  return c.redirect(`/article/${article.slug}`);
});

async function findEditableArticle(slug: string, userId: string) {
  const article = await findArticleBySlug(slug);
  if (!article) throw new HTTPException(404, { message: "記事が見つかりません" });
  if (!canEdit(article, userId)) throw new HTTPException(403, { message: "この記事は編集できません" });
  return article;
}
