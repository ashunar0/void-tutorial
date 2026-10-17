import type { Props } from "./index.server";

export default function ArticlePage({ article }: Props) {
  return (
    <main>
      <h1>{article.title}</h1>
      <p>@{article.authorName} ・ {article.createdAt}</p>
      <p>{article.description}</p>
      {/* Markdown を HTML にするのは後で。いまは原文のまま出す */}
      <pre>{article.body}</pre>
    </main>
  );
}
