import { db, eq } from "void/db";
import { users } from "#domains/users/table";

// プロフィールの URL（/profile/:username）から会員を引く。メールアドレスは選ばない
export async function findUserByName(name: string) {
  const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.name, name));
  return user ?? null;
}
