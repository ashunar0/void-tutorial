import { Form, useForm } from "@void/react";
import { ArticleFields } from "#components/ArticleFields";
import type { Props } from "./index.server";

export default function EditArticlePage({ article }: Props) {
  const { slug, ...fields } = article;
  const form = useForm("/editor/:slug", fields, { params: { slug } });

  return (
    <main>
      <h1>記事を直す</h1>
      <Form form={form}>
        <ArticleFields form={form} />
        <button disabled={form.pending}>更新する</button>
      </Form>
    </main>
  );
}
