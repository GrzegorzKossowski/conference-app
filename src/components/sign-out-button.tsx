"use client";

import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/organizer/login") return null;

  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
      className="text-sm text-gray-500 hover:text-black"
    >
      Wyloguj
    </button>
  );
}
