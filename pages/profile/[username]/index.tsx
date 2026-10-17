import { Link } from "@void/react";
import { FavoriteButton } from "#components/FavoriteButton";
import { FollowButton } from "#components/FollowButton";
import type { Props } from "./index.server";

export default function ProfilePage({ profile, following, canFollow, articles }: Props) {
  return (
    <main>
      <h1>@{profile.username}</h1>
      {canFollow && <FollowButton username={profile.username} following={following} />}
      <h2>書いた記事</h2>
      {articles.length === 0 && <p>まだ記事がありません</p>}
      {articles.map((article) => (
        <article key={article.slug}>
          <p>{article.createdAt}</p>
          <FavoriteButton slug={article.slug} state={article.favorite} />
          <h3><Link href={`/article/${article.slug}`}>{article.title}</Link></h3>
          <p>{article.description}</p>
        </article>
      ))}
    </main>
  );
}
