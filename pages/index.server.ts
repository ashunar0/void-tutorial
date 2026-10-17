import { articles } from "@schema";
import { defineHandler, type InferProps } from "void";
import { db, desc, eq } from "void/db";
import { userTable } from "../.void/better-auth-schema";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  const rows = await db
    .select({
      slug: articles.slug,
      title: articles.title,
      description: articles.description,
      createdAt: articles.createdAt,
      authorName: userTable.name,
    })
    .from(articles)
    .innerJoin(userTable, eq(userTable.id, articles.authorId))
    .orderBy(desc(articles.createdAt), desc(articles.id))
    .limit(10);
  return { articles: rows };
});
