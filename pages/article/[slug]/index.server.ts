import { articles } from "@schema";
import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { getUser, requireAuth } from "void/auth";
import { createSelectSchema } from "void/drizzle-zod";
import { deleteArticle } from "#domains/articles/commands";
import { canEdit } from "#domains/articles/policy";
import { findArticleBySlug } from "#domains/articles/queries";
import { createComment, deleteComment } from "#domains/comments/commands";
import { commentInput, commentRef } from "#domains/comments/input";
import { canDeleteComment } from "#domains/comments/policy";
import { findComment, listComments } from "#domains/comments/queries";
import { getFavoriteState } from "#domains/favorites/queries";
import { canFollow } from "#domains/follows/policy";
import { isFollowing } from "#domains/follows/queries";

const params = createSelectSchema(articles).pick({ slug: true });

// withValidator 付きの loader は戻り値の Promise がほどかれない（Void 1.1.11 の型の穴）ので Awaited を足す
export type Props = Awaited<InferProps<typeof loader>>;

export const loader = defineHandler.withValidator({ params })(async (_c, { params }) => {
  const article = await findArticleOr404(params.slug);
  const viewerId = getUser()?.id ?? null;
  const favorite = await getFavoriteState(article.id, viewerId);
  const rows = await listComments(article.id);
  const comments = rows.map(({ authorId, ...comment }) => ({ ...comment, canDelete: canDeleteComment({ authorId }, viewerId) }));
  const author = { following: await isFollowing(viewerId, article.authorId), canFollow: canFollow(viewerId, article.authorId) };
  return { article, favorite, comments, author, canEdit: canEdit(article, viewerId) };
});

// どれもこの画面にしかない操作なので、API ではなくこの画面の action にする
export const actions = {
  deleteArticle: defineHandler.withValidator({ params })(async (c, { params }) => {
    const user = requireAuth(c);
    const article = await findArticleOr404(params.slug);
    if (!canEdit(article, user.id)) throw new HTTPException(403, { message: "この記事は削除できません" });
    await deleteArticle(article.id);
    return c.redirect("/");
  }),

  postComment: defineHandler.withValidator({ params, body: commentInput })(async (c, { params, body }) => {
    const user = requireAuth(c);
    const article = await findArticleOr404(params.slug);
    await createComment({ articleId: article.id, authorId: user.id, body: body.body });
  }),

  deleteComment: defineHandler.withValidator({ body: commentRef })(async (c, { body }) => {
    const user = requireAuth(c);
    const comment = await findComment(body.id);
    if (!comment) throw new HTTPException(404, { message: "コメントが見つかりません" });
    if (!canDeleteComment(comment, user.id)) throw new HTTPException(403, { message: "このコメントは削除できません" });
    await deleteComment(comment.id);
  }),
};

async function findArticleOr404(slug: string) {
  const article = await findArticleBySlug(slug);
  if (!article) throw new HTTPException(404, { message: "記事が見つかりません" });
  return article;
}
