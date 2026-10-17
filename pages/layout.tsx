import { Link, useRouter, useShared } from "@void/react";
import type { ReactNode } from "react";
import { auth } from "void/client";

export default function Layout({ children }: { children: ReactNode }) {
  const { currentUser } = useShared();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.visit("/");
  };

  return (
    <>
      <header>
        <Link href="/">conduit</Link>
        {currentUser ? (
          <>
            <Link href="/editor"> 記事を書く</Link>
            <span> @{currentUser.name}</span>
            <button onClick={handleSignOut}>ログアウト</button>
          </>
        ) : (
          <>
            <Link href="/login"> ログイン</Link>
            <Link href="/register"> 登録</Link>
          </>
        )}
      </header>
      {children}
    </>
  );
}
