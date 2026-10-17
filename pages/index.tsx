import { Link } from "@void/react";
import { FavoriteButton } from "#components/FavoriteButton";
import type { Props } from "./index.server";

export default function HomePage({ articles }: Props) {
  return (
    <main>
      <h1>新着</h1>
      {articles.length === 0 && <p>まだ記事がありません</p>}
      {articles.map((article) => (
        <article key={article.slug}>
          <p>@{article.authorName} ・ {article.createdAt}</p>
          <FavoriteButton slug={article.slug} state={article.favorite} />
          <h2><Link href={`/article/${article.slug}`}>{article.title}</Link></h2>
          <p>{article.description}</p>
        </article>
      ))}
    </main>
  );
}
