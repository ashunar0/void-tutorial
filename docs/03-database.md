# データベース

## 方針

- 認証のテーブル（`user`、`session` など）は Void が作る。`db/schema.ts` には書かない
- 自分のテーブルの会員 ID は、認証の `user.id`（文字列）をそのまま使う。ユーザー名は `user.name` から読む
- 会員を参照する外部キーは `profiles` ではなく認証の `user` に向ける。プロフィールの行がない会員もいるので
- 記事・コメントの ID は自動採番の整数。URL には `slug` を出すので、ID が外から見えても困らない
- 日時は `datetime('now')` の UTC 文字列（雛形と同じ）
- いいね数は保存しない。`favorites` から数える
- 記事を消したときの連鎖削除は外部キーの `ON DELETE CASCADE` に任せる。D1 は外部キー制約が有効

## テーブル定義

Drizzle で `db/schema.ts` に書く。下は形を決めるための DDL。

```sql
-- プロフィール（認証の user と1対1。設定画面で初めて保存したときに作る）
CREATE TABLE profiles (
  user_id       TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
  display_name  TEXT,
  bio           TEXT NOT NULL DEFAULT '',
  image       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 記事
CREATE TABLE articles (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  body         TEXT NOT NULL,          -- Markdown のまま
  author_id    TEXT NOT NULL REFERENCES user(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- タグと、記事へのタグ付け
CREATE TABLE tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL UNIQUE
);
CREATE TABLE article_tags (
  article_id  INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id      INTEGER NOT NULL REFERENCES tags(id),
  PRIMARY KEY (article_id, tag_id)
);

-- いいね
CREATE TABLE favorites (
  user_id     TEXT NOT NULL REFERENCES user(id),
  article_id  INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, article_id)
);

-- コメント
CREATE TABLE comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id  INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_id   TEXT NOT NULL REFERENCES user(id),
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- フォロー
CREATE TABLE follows (
  follower_id  TEXT NOT NULL REFERENCES user(id),
  followee_id  TEXT NOT NULL REFERENCES user(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);

CREATE INDEX idx_articles_created   ON articles (created_at);           -- 全体の新着
CREATE INDEX idx_articles_author    ON articles (author_id, created_at); -- 会員の記事、フォロー中の新着
CREATE INDEX idx_article_tags_tag   ON article_tags (tag_id);           -- タグ絞り込み、よく使われているタグ
CREATE INDEX idx_favorites_article  ON favorites (article_id);          -- いいね数
CREATE INDEX idx_comments_article   ON comments (article_id, created_at);
CREATE INDEX idx_follows_followee   ON follows (followee_id);
```

主キーが複合のテーブル（`favorites`、`follows`、`article_tags`）は、主キーがそのまま重複の禁止になる。

## よく使うクエリ

```sql
-- 記事一覧（? は見ている人の ID。訪問者なら NULL）
SELECT a.*, u.name AS username, p.display_name, p.image,
  (SELECT COUNT(*) FROM favorites f WHERE f.article_id = a.id)                    AS favorites_count,
  EXISTS (SELECT 1 FROM favorites f WHERE f.article_id = a.id AND f.user_id = ?)  AS favorited
FROM articles a
JOIN user u ON u.id = a.author_id
LEFT JOIN profiles p ON p.user_id = a.author_id   -- プロフィールがない会員もいる
ORDER BY a.created_at DESC, a.id DESC
LIMIT 10 OFFSET ?;

-- フォロー中の新着：上に足す
WHERE a.author_id IN (SELECT followee_id FROM follows WHERE follower_id = ?)

-- よく使われているタグ
SELECT t.name, COUNT(*) AS n
FROM article_tags at JOIN tags t ON t.id = at.tag_id
GROUP BY t.id ORDER BY n DESC LIMIT 20;
```

一覧のタグ（記事ごとに複数）は、一覧の記事 ID でまとめて引いてアプリで振り分ける。1記事ずつ引かない。

## 書き込み時の注意

- **記事の作成と編集**：記事の保存、タグの作成（無ければ）、タグ付けの差し替えを1回の `db.batch` にまとめる。途中で失敗してタグだけ残る、を避ける
- **slug の重複**：ランダム6文字が衝突したら UNIQUE 制約で失敗するので、作り直して1回だけやり直す
- **いいね・フォロー**：`INSERT ... ON CONFLICT DO NOTHING` と `DELETE` にする。二度押しされても結果が同じになる

## シードデータの方針

| 用意するデータ | 確かめられること |
|---|---|
| 会員3人（A・B・C）。A は B をフォロー | フォロー中の新着に B の記事だけ出る |
| B の記事を12本 | 2ページ目に送れる |
| タグの付いた記事と、付いていない記事 | タグ絞り込み、よく使われているタグ |
| A と C が B の記事にいいね | いいね数が2、A で見るといいね済み |
| B の記事に A のコメント | B はコメントを消せない、A は消せる |

## まだ決めていないこと

- `profiles` から認証の `user` テーブルに外部キーを張れるか。認証のテーブルは Void が `.void/better-auth-schema.ts` に生成するので、`db/schema.ts` から参照できるか試す。張れなければ外部キーなしにする
