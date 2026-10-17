import { useRouter } from "@void/react";
import { useState, type FormEvent } from "react";
import { auth } from "void/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await auth.signUp.email({ name, email, password });
    if (result.error) {
      setError(result.error.message ?? "登録できませんでした");
      return;
    }
    router.visit("/");
  };

  return (
    <main>
      <h1>登録</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>ユーザー名 <input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label>メールアドレス <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>パスワード <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button>登録</button>
      </form>
    </main>
  );
}
