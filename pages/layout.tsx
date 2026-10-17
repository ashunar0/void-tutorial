import { Link, useShared } from "@void/react";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const { currentUser } = useShared();
  return (
    <>
      <header>
        <Link href="/">conduit</Link>
        {currentUser ? <span> @{currentUser.name}</span> : <Link href="/register"> 登録</Link>}
      </header>
      {children}
    </>
  );
}
