import { action, Form, Link, useForm, useShared } from "@void/react";
import { useEffect } from "react";
import { FavoriteButton } from "#components/FavoriteButton";
import { FollowButton } from "#components/FollowButton";
import type { Props } from "./index.server";

export default function ArticlePage({ article, favorite, comments, author, canEdit }: Props) {
  const { currentUser } = useShared();

  const handleDelete = () => {
    action("/article/:slug?deleteArticle", { params: { slug: article.slug }, method: "DELETE" });
  };

  return (
    <main>
      <h1>{article.title}</h1>
      <p><Link href={`/profile/${article.authorName}`}>@{article.authorName}</Link> ・ {article.createdAt}</p>
      {author.canFollow && <FollowButton username={article.authorName} following={author.following} />}
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

      <h2>コメント</h2>
      {currentUser ? <CommentForm slug={article.slug} /> : <p><Link href="/login">ログイン</Link>するとコメントできます</p>}
      {comments.map((comment) => <CommentItem key={comment.id} slug={article.slug} comment={comment} />)}
    </main>
  );
}

function CommentForm({ slug }: { slug: string }) {
  const form = useForm("/article/:slug?postComment", { body: "" }, { params: { slug } });

  // useForm は成功すると送った内容を初期値にするので、reset() では空にならない。自分で空にする
  useEffect(() => {
    if (form.wasSuccessful) form.setData("body", "");
  }, [form.wasSuccessful]);

  return (
    <Form form={form}>
      <textarea value={form.data.body} onChange={(e) => form.setData("body", e.target.value)} />
      {form.errors.body && <p>{form.errors.body}</p>}
      <button disabled={form.pending}>コメントする</button>
    </Form>
  );
}

function CommentItem({ slug, comment }: { slug: string; comment: Props["comments"][number] }) {
  const handleDelete = () => {
    action("/article/:slug?deleteComment", { params: { slug }, data: { id: comment.id }, method: "DELETE" });
  };

  return (
    <div>
      <p>{comment.body}</p>
      <p>@{comment.authorName} ・ {comment.createdAt} {comment.canDelete && <button onClick={handleDelete}>削除</button>}</p>
    </div>
  );
}
