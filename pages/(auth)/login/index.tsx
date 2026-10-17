import { useRouter } from "@void/react";
import { useState, type FormEvent } from "react";
import { auth } from "void/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await auth.signIn.email({ email, password });
    if (result.error) {
      setError(result.error.message ?? "ログインできませんでした");
      return;
    }
    router.visit("/");
  };

  return (
    <main>
      <h1>ログイン</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>メールアドレス <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>パスワード <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        <button>ログイン</button>
      </form>
    </main>
  );
}
