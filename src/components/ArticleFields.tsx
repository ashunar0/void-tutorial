type Fields = { title: string; description: string; body: string };

// 記事の作成と編集で共通の入力欄。form は useForm の戻り値をそのまま渡す
type Props = {
  form: {
    data: Fields;
    errors: Partial<Record<keyof Fields, string>>;
    setData: (key: keyof Fields, value: string) => void;
  };
};

export function ArticleFields({ form }: Props) {
  return (
    <>
      <label>タイトル <input value={form.data.title} onChange={(e) => form.setData("title", e.target.value)} /></label>
      {form.errors.title && <p>{form.errors.title}</p>}
      <label>概要 <input value={form.data.description} onChange={(e) => form.setData("description", e.target.value)} /></label>
      {form.errors.description && <p>{form.errors.description}</p>}
      <label>本文（Markdown） <textarea value={form.data.body} onChange={(e) => form.setData("body", e.target.value)} /></label>
      {form.errors.body && <p>{form.errors.body}</p>}
    </>
  );
}
