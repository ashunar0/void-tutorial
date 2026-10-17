import { defineHandler, type InferProps } from "void";
import { getUser } from "void/auth";
import { z } from "zod";
import { listArticles } from "#domains/articles/queries";
import { getFavoriteStates } from "#domains/favorites/queries";
import { listFolloweeIds } from "#domains/follows/queries";

// withValidator 付きの loader は、戻り値の Promise をほどかず、c.redirect の Response も型から外さない
// （Void 1.1.11 の型の穴。素の defineHandler は Exclude<Awaited<R>, Response> にしている）ので自分で外す
export type Props = Exclude<Awaited<InferProps<typeof loader>>, Response>;

export const loader = defineHandler.withValidator({
  query: z.object({ feed: z.enum(["following"]).optional() }),
})(async (c, { query }) => {
  const viewer = getUser();

  // フォロー中の新着は、フォローしている会員の記事だけにする
  let authorIds: string[] | undefined;
  if (query.feed === "following") {
    if (!viewer) return c.redirect("/login");
    authorIds = await listFolloweeIds(viewer.id);
  }

  const rows = await listArticles({ authorIds });
  const favorites = await getFavoriteStates(rows.map((row) => row.id), viewer?.id ?? null);
  return {
    feed: query.feed ?? "global",
    articles: rows.map((row) => ({ ...row, favorite: favorites.get(row.id)! })),
  };
});
