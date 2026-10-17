import { defineHandler, type InferProps } from "void";
import { getUser } from "void/auth";
import { listArticles } from "#domains/articles/queries";
import { getFavoriteStates } from "#domains/favorites/queries";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  const rows = await listArticles();
  const favorites = await getFavoriteStates(rows.map((row) => row.id), getUser()?.id ?? null);
  return { articles: rows.map((row) => ({ ...row, favorite: favorites.get(row.id)! })) };
});
