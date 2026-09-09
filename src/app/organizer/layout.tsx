import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/organizer" className="font-semibold">
              Panel organizatora
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-black">
              Strona główna
            </Link>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
