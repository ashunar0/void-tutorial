import { useRouter } from "@void/react";
import { fetch, FetchError } from "void/client";
import type { FavoriteState } from "#domains/favorites/queries";

type Props = { slug: string; state: FavoriteState };

export function FavoriteButton({ slug, state }: Props) {
  const router = useRouter();

  const handleClick = async () => {
    try {
      await fetch("/api/articles/:slug/favorite", { method: state.favorited ? "DELETE" : "PUT", params: { slug } });
      router.refresh();
    } catch (error) {
      if (error instanceof FetchError && error.status === 401) return router.visit("/login");
      throw error;
    }
  };

  return <button onClick={handleClick}>{state.favorited ? "いいね済み" : "いいね"} {state.count}</button>;
}
