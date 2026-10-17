import { defineMiddleware } from "void";
import { getUser } from "void/auth";

type CurrentUser = { id: string; name: string };

declare module "void" {
  interface CloudContextVariables {
    shared: { currentUser: CurrentUser | null };
  }
}

export default defineMiddleware(async (c, next) => {
  const user = getUser();
  // 全画面の HTML に埋め込まれるので、メールアドレスは渡さない
  const currentUser = user ? { id: user.id, name: user.name } : null;
  c.set("shared", { currentUser });
  await next();
});
