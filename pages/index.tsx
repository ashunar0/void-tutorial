import { action, Link } from "@void/react";
import type { Props } from "./index.server";

type ArticleItem = Props["articles"][number];

export default function HomePage({ articles }: Props) {
  return (
    <main>
      <h1>新着</h1>
      {articles.length === 0 && <p>まだ記事がありません</p>}
      {articles.map((article) => <ArticlePreview key={article.slug} article={article} />)}
    </main>
  );
}

function ArticlePreview({ article }: { article: ArticleItem }) {
  const handleFavorite = () => {
    action("/?favorite", { data: { slug: article.slug, favorite: !article.favorite.favorited } });
  };

  return (
    <article>
      <p>@{article.authorName} ・ {article.createdAt}</p>
      <button onClick={handleFavorite}>{article.favorite.favorited ? "いいね済み" : "いいね"} {article.favorite.count}</button>
      <h2><Link href={`/article/${article.slug}`}>{article.title}</Link></h2>
      <p>{article.description}</p>
    </article>
  );
}
