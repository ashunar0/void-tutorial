import { Link, useShared } from "@void/react";
import { FavoriteButton } from "#components/FavoriteButton";
import type { Props } from "./index.server";

export default function HomePage({ feed, articles }: Props) {
  const { currentUser } = useShared();

  return (
    <main>
      <nav>
        <Link href="/">{feed === "global" ? <strong>全体の新着</strong> : "全体の新着"}</Link>
        {currentUser && <Link href="/?feed=following"> {feed === "following" ? <strong>フォロー中</strong> : "フォロー中"}</Link>}
      </nav>
      {articles.length === 0 && <p>まだ記事がありません</p>}
      {articles.map((article) => (
        <article key={article.slug}>
          <p><Link href={`/profile/${article.authorName}`}>@{article.authorName}</Link> ・ {article.createdAt}</p>
          <FavoriteButton slug={article.slug} state={article.favorite} />
          <h2><Link href={`/article/${article.slug}`}>{article.title}</Link></h2>
          <p>{article.description}</p>
        </article>
      ))}
    </main>
  );
}
