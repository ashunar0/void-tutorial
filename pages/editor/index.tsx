import { Form, useForm } from "@void/react";

export default function EditorPage() {
  const form = useForm("/editor", { title: "", description: "", body: "" });

  return (
    <main>
      <h1>記事を書く</h1>
      <Form form={form}>
        <label>タイトル <input value={form.data.title} onChange={(e) => form.setData("title", e.target.value)} /></label>
        {form.errors.title && <p>{form.errors.title}</p>}
        <label>概要 <input value={form.data.description} onChange={(e) => form.setData("description", e.target.value)} /></label>
        {form.errors.description && <p>{form.errors.description}</p>}
        <label>本文（Markdown） <textarea value={form.data.body} onChange={(e) => form.setData("body", e.target.value)} /></label>
        {form.errors.body && <p>{form.errors.body}</p>}
        <button disabled={form.pending}>公開する</button>
      </Form>
    </main>
  );
}
