import { defineHandler } from "void";
import { getUser, requireAuth } from "void/auth";
import { createArticle } from "#domains/articles/commands";
import { articleInput } from "#domains/articles/input";

export const loader = defineHandler((c) => {
  if (!getUser()) return c.redirect("/login");
  return {};
});

export const action = defineHandler.withValidator({ body: articleInput })(async (c, { body }) => {
  const user = requireAuth(c);
  const { slug } = await createArticle({ ...body, authorId: user.id });
  return c.redirect(`/article/${slug}`);
});
