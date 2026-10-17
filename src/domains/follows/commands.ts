import { follows } from "@schema";
import { and, db, eq } from "void/db";

// 「する / しない」を受け取る。二度送っても結果が同じになる
export async function setFollow(followerId: string, followeeId: string, follow: boolean): Promise<void> {
  if (follow) {
    await db.insert(follows).values({ followerId, followeeId }).onConflictDoNothing();
  } else {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followeeId, followeeId)));
  }
}
