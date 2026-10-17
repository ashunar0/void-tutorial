import { Form, useForm } from "@void/react";
import { ArticleFields } from "#components/ArticleFields";

export default function NewArticlePage() {
  const form = useForm("/editor", { title: "", description: "", body: "" });

  return (
    <main>
      <h1>記事を書く</h1>
      <Form form={form}>
        <ArticleFields form={form} />
        <button disabled={form.pending}>公開する</button>
      </Form>
    </main>
  );
}
