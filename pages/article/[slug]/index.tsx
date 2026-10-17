import { action, Link } from "@void/react";
import { FavoriteButton } from "#components/FavoriteButton";
import type { Props } from "./index.server";

export default function ArticlePage({ article, favorite, canEdit }: Props) {
  const handleDelete = () => {
    action("/article/:slug", { params: { slug: article.slug }, method: "DELETE" });
  };

  return (
    <main>
      <h1>{article.title}</h1>
      <p>@{article.authorName} ・ {article.createdAt}</p>
      <FavoriteButton slug={article.slug} state={favorite} />
      {canEdit && (
        <>
          <Link href={`/editor/${article.slug}`}>編集</Link>
          <button onClick={handleDelete}>削除</button>
        </>
      )}
      <p>{article.description}</p>
      {/* Markdown を HTML にするのは後で。いまは原文のまま出す */}
      <pre>{article.body}</pre>
    </main>
  );
}
