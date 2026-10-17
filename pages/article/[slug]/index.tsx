import { action } from "@void/react";
import type { Props } from "./index.server";

export default function ArticlePage({ article, favorite }: Props) {
  const handleFavorite = () => {
    action("/article/:slug?favorite", { params: { slug: article.slug }, data: { favorite: !favorite.favorited } });
  };

  return (
    <main>
      <h1>{article.title}</h1>
      <p>@{article.authorName} ・ {article.createdAt}</p>
      <button onClick={handleFavorite}>{favorite.favorited ? "いいね済み" : "いいね"} {favorite.count}</button>
      <p>{article.description}</p>
      {/* Markdown を HTML にするのは後で。いまは原文のまま出す */}
      <pre>{article.body}</pre>
    </main>
  );
}
