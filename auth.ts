import { APIError } from "better-auth/api";
import { defineAuth } from "void/auth";

// name にはユーザー名（@ID）を入れている。Better Auth は name の形も重複も確かめないので、ここで守る
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export default defineAuth(({ defaults }) => ({
  ...defaults,
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          if (!USERNAME_PATTERN.test(user.name)) {
            throw new APIError("BAD_REQUEST", { message: "ユーザー名は英小文字・数字・_ の3〜20文字にしてください" });
          }
          const existing = await ctx?.context.adapter.findOne({ model: "user", where: [{ field: "name", value: user.name }] });
          if (existing) {
            throw new APIError("UNPROCESSABLE_ENTITY", { message: "このユーザー名はすでに使われています" });
          }
        },
      },
    },
  },
}));
