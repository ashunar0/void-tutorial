import { articles } from "@schema";
import { defineHandler } from "void";
import { getUser, requireAuth } from "void/auth";
import { createInsertSchema } from "void/drizzle-zod";
import { createArticle } from "../../src/domains/articles/commands";

export const loader = defineHandler((c) => {
  if (!getUser()) return c.redirect("/login");
  return {};
});

export const action = defineHandler.withValidator({
  body: createInsertSchema(articles, {
    title: (s) => s.trim().min(1).max(200),
    description: (s) => s.trim().min(1).max(500),
    body: (s) => s.trim().min(1),
  }).pick({ title: true, description: true, body: true }),
})(async (c, { body }) => {
  const user = requireAuth(c);
  const { slug } = await createArticle({ ...body, authorId: user.id });
  return c.redirect(`/article/${slug}`);
});
