import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { getUser } from "void/auth";
import { z } from "zod";
import { listArticles } from "#domains/articles/queries";
import { getFavoriteStates } from "#domains/favorites/queries";
import { canFollow } from "#domains/follows/policy";
import { isFollowing } from "#domains/follows/queries";
import { findUserByName } from "#domains/users/queries";

// withValidator 付きの loader は戻り値の Promise がほどかれない（Void 1.1.11 の型の穴）ので Awaited を足す
export type Props = Awaited<InferProps<typeof loader>>;

export const loader = defineHandler.withValidator({
  params: z.object({ username: z.string() }),
})(async (_c, { params }) => {
  const user = await findUserByName(params.username);
  if (!user) throw new HTTPException(404, { message: "会員が見つかりません" });
  const viewerId = getUser()?.id ?? null;

  const rows = await listArticles({ authorIds: [user.id] });
  const favorites = await getFavoriteStates(rows.map((row) => row.id), viewerId);
  return {
    profile: { username: user.name },
    following: await isFollowing(viewerId, user.id),
    canFollow: canFollow(viewerId, user.id),
    articles: rows.map((row) => ({ ...row, favorite: favorites.get(row.id)! })),
  };
});
