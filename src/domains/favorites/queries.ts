import { favorites } from "@schema";
import { and, count, db, eq, inArray } from "void/db";

export type FavoriteState = { count: number; favorited: boolean };

// 記事ごとのいいね数と、見ている人がいいね済みか。viewerId が null（訪問者）なら favorited は常に false
export async function getFavoriteStates(articleIds: number[], viewerId: string | null): Promise<Map<number, FavoriteState>> {
  const states = new Map(articleIds.map((id) => [id, { count: 0, favorited: false }]));
  if (articleIds.length === 0) return states;

  const counts = await db
    .select({ articleId: favorites.articleId, total: count() })
    .from(favorites)
    .where(inArray(favorites.articleId, articleIds))
    .groupBy(favorites.articleId);
  for (const { articleId, total } of counts) states.get(articleId)!.count = total;

  if (viewerId) {
    const mine = await db
      .select({ articleId: favorites.articleId })
      .from(favorites)
      .where(and(inArray(favorites.articleId, articleIds), eq(favorites.userId, viewerId)));
    for (const { articleId } of mine) states.get(articleId)!.favorited = true;
  }
  return states;
}

export async function getFavoriteState(articleId: number, viewerId: string | null): Promise<FavoriteState> {
  const states = await getFavoriteStates([articleId], viewerId);
  return states.get(articleId)!;
}
