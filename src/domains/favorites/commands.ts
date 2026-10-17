import { favorites } from "@schema";
import { and, db, eq } from "void/db";

// トグルではなく「する / しない」を受け取る。二度押しされても結果が同じになる
export async function setFavorite(userId: string, articleId: number, favorite: boolean): Promise<void> {
  if (favorite) {
    await db.insert(favorites).values({ userId, articleId }).onConflictDoNothing();
  } else {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.articleId, articleId)));
  }
}
