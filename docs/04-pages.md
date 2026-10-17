# 画面と操作

## 方針

このタブは「どの画面で何ができればいいか」を決めるためのもの。ファイルの切り方や action の分け方は、作りながら上書きしてよい。

- **画面は `pages/`。** 読むのは loader、書き込みは同じ画面の action。action が何も返さなければ loader が走り直して画面が更新される
- **複数の画面に出る操作は API（`routes/api/`）にする。** その画面だけの操作は action。いいね・フォローのように同じボタンが何画面にも出るものは、API を1本作って `void/client` の `fetch` で呼び、成功したら `router.refresh()` で props を読み直す
- **ログインが要る操作**：action の頭で会員を確かめ、訪問者なら `/login` へ送る
- **URL は RealWorld に合わせる**：記事は `/article/:slug`、プロフィールは `/profile/:username`

## 画面一覧

| URL | 画面 | loader で読むもの | action |
|---|---|---|---|
| `/` | ホーム | 記事一覧（`?feed=following` でフォロー中、`?tag=` で絞り込み、`?page=`）、よく使われているタグ | いいね |
| `/register` | 登録 | なし | なし（画面から `auth.signUp.email` を呼ぶ） |
| `/login` | ログイン | なし | なし（画面から `auth.signIn.email` を呼ぶ） |
| `/settings` | 設定 | 自分のプロフィール | プロフィールの更新（ログアウトは画面から `auth.signOut`） |
| `/editor` | 記事を書く | なし | 記事の作成 |
| `/editor/:slug` | 記事を直す | その記事（書き手本人のみ） | 記事の更新 |
| `/article/:slug` | 記事 | 記事、書き手、いいね、コメント | いいね、フォロー、コメントの投稿・削除、記事の削除 |
| `/profile/:username` | プロフィール | プロフィール、その人の記事（`?tab=favorites` でいいねした記事） | フォロー、いいね |

全画面に出すヘッダ（ログイン中の会員のユーザー名）は、ミドルウェアで `shared` に入れて `useShared()` で読む。

## 決めたこと

- **いいねとフォローは `PUT` で「する」、`DELETE` で「しない」。** トグル（今の状態の逆にする）にしない。トグルだと二度押しで元に戻るので。`PUT` と `DELETE` はどちらも二度送っても結果が同じ。画面は loader から受け取った今の状態を見て、どちらを送るか決める
- **登録とログインは `useForm` を使わず、画面から `auth.signUp.email` / `auth.signIn.email` を呼ぶ。** Void の公式の書き方（docs と playground の kitchen-sink）に合わせた。エラーは自分の state に入れる。Inertia の流儀なら action と `useForm` で書く場面だが、Void は Better Auth をサーバーから呼ぶ口を公開していない（`c.get("__voidAuth")` は非公開）。今回は Void の流儀を知るのが目的なので乗っかる
- **いいねは `PUT` / `DELETE /api/articles/:slug/favorite`。ボタンは `src/components/FavoriteButton.tsx` の1つだけ。** 同じ操作がホーム・記事・プロフィールの3か所に出る。画面ごとに action を書くと「記事を探す → なければ 404 → いいね」が画面の数だけ並ぶ。ほかの画面の action に送る形も取れない。`action()` は `router.visit` で送り先の画面に移動するので、ホームから記事の action に送ると記事の画面に移ってしまう。また、名前付き action を呼ぶと URL に `?favorite` が残る。訪問者が押したら API が 401 を返し、ボタンが `/login` へ移動させる
- **ドメインをまたぐ組み合わせは loader が書く。** ドメイン（`src/domains/`）は1つのドメインのことだけをやり、画面に要るものを集めて組み合わせるのは loader の役割。たとえば一覧は、記事を引いてから `getFavoriteStates(articleIds, viewerId)` でまとめて引いてくっつける。フォロー中の新着は、`listFolloweeIds` で ID を引いてから `listArticles({ authorIds })` に渡す。ドメインどうしはお互いを import しない。同じ組み合わせが複数の loader に出ても、画面ごとに組み合わせ方が少しずつ違うので共通化しない（またぐ処理の置き場を別に作る案は採らなかった）
- **記事の削除・コメントの投稿・コメントの削除は、記事の画面の名前付き action（`?deleteArticle` / `?postComment` / `?deleteComment`）。** どれもこの画面にしか出ないので API にしない。コメントの投稿は `useForm` を使いたい。`useForm` は pages の action にしか送れない（型は `ActionUrl`、送信は `router.visit`）
- **記事を消したら `/` へ送る。** 消した記事の画面に留まると loader が 404 になる
- **コメントを送ったら、画面で入力欄を空にする。** `useForm` は成功すると送った内容を初期値にするので `reset()` では空にならない。`wasSuccessful` を見て `setData` する
- **「編集」「削除」を出すかは loader が決める。** loader が `canEdit` の結果を返し、画面は書き手の ID と自分の ID を比べない。判定を `policy.ts` の1か所にするため
- **記事を作ったら、その記事の画面へ送る**

## まだ決めていないこと

- リダイレクト先に、元の URL の検索文字列がくっつく。名前付き action から `c.redirect("/")` を返すと `/?deleteArticle` に、`/?feed=following` の loader から `c.redirect("/login")` を返すと `/login?feed=following` になる。名前付き action のあと URL に `?アクション名` が残るのも同じ原因と思われる。Void に報告するか決める

- Markdown を HTML にするライブラリと、どこで変換するか（loader か画面か）
