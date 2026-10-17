import { useRouter } from "@void/react";
import { fetch, FetchError } from "void/client";

type Props = { username: string; following: boolean };

export function FollowButton({ username, following }: Props) {
  const router = useRouter();

  const handleClick = async () => {
    try {
      await fetch("/api/profiles/:username/follow", { method: following ? "DELETE" : "PUT", params: { username } });
      router.refresh();
    } catch (error) {
      if (error instanceof FetchError && error.status === 401) return router.visit("/login");
      throw error;
    }
  };

  return <button onClick={handleClick}>{following ? `@${username} のフォローを解除` : `@${username} をフォロー`}</button>;
}
