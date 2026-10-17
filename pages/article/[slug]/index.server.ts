import { articles } from "@schema";
import { HTTPException } from "hono/http-exception";
import { defineHandler, type InferProps } from "void";
import { createSelectSchema } from "void/drizzle-zod";
import { findArticleBySlug } from "#domains/articles/queries";

// withValidator 付きの loader は戻り値の Promise がほどかれない（Void 1.1.11 の型の穴）ので Awaited を足す
export type Props = Awaited<InferProps<typeof loader>>;

export const loader = defineHandler.withValidator({
  params: createSelectSchema(articles).pick({ slug: true }),
})(async (_c, { params }) => {
  const article = await findArticleBySlug(params.slug);
  if (!article) throw new HTTPException(404, { message: "記事が見つかりません" });
  return { article };
});
