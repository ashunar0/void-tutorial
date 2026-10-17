import { follows } from "@schema";
import { and, db, eq } from "void/db";

// viewerId が null（訪問者）なら常に false
export async function isFollowing(viewerId: string | null, followeeId: string): Promise<boolean> {
  if (!viewerId) return false;
  const [row] = await db
    .select({ followeeId: follows.followeeId })
    .from(follows)
    .where(and(eq(follows.followerId, viewerId), eq(follows.followeeId, followeeId)));
  return Boolean(row);
}

// フォロー中の新着で使う。フォローしている会員の ID の一覧
export async function listFolloweeIds(followerId: string): Promise<string[]> {
  const rows = await db.select({ followeeId: follows.followeeId }).from(follows).where(eq(follows.followerId, followerId));
  return rows.map((row) => row.followeeId);
}
