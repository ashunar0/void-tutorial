import { defineHandler, type InferProps } from "void";
import { listArticles } from "#domains/articles/queries";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  return { articles: await listArticles() };
});
