import { HTTPException } from "hono/http-exception";
import { defineHandler } from "void";
import { requireAuth } from "void/auth";
import { z } from "zod";
import { setFollow } from "#domains/follows/commands";
import { canFollow } from "#domains/follows/policy";
import { findUserByName } from "#domains/users/queries";

// PUT でフォロー、DELETE で解除。どちらも二度送っても結果は同じ
const params = z.object({ username: z.string() });

export const PUT = defineHandler.withValidator({ params })(async (c, { params }) => {
  const user = requireAuth(c);
  const followeeId = await findUserIdOr404(params.username);
  if (!canFollow(user.id, followeeId)) throw new HTTPException(422, { message: "自分自身はフォローできません" });
  await setFollow(user.id, followeeId, true);
  return c.body(null, 204);
});

export const DELETE = defineHandler.withValidator({ params })(async (c, { params }) => {
  const user = requireAuth(c);
  await setFollow(user.id, await findUserIdOr404(params.username), false);
  return c.body(null, 204);
});

async function findUserIdOr404(username: string): Promise<string> {
  const user = await findUserByName(username);
  if (!user) throw new HTTPException(404, { message: "会員が見つかりません" });
  return user.id;
}
