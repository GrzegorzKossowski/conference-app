import Link from "next/link";

export function HomeLink() {
  return (
    <Link href="/" className="text-sm text-gray-500 hover:text-black">
      ← Strona główna
    </Link>
  );
}
