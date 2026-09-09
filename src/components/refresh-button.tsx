"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
    >
      {pending ? "Odświeżanie..." : "↻ Odśwież"}
    </button>
  );
}
