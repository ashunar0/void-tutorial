import { favorites } from "@schema";
import { and, count, db, eq } from "void/db";

export type FavoriteState = { count: number; favorited: boolean };

// viewerId が null（訪問者）なら favorited は常に false
export async function getFavoriteState(articleId: number, viewerId: string | null): Promise<FavoriteState> {
  const [{ total }] = await db.select({ total: count() }).from(favorites).where(eq(favorites.articleId, articleId));
  if (!viewerId) return { count: total, favorited: false };
  const [mine] = await db
    .select({ articleId: favorites.articleId })
    .from(favorites)
    .where(and(eq(favorites.articleId, articleId), eq(favorites.userId, viewerId)));
  return { count: total, favorited: Boolean(mine) };
}
