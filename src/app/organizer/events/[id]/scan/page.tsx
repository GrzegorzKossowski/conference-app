import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { QrScanner } from "@/components/qr-scanner";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event] = await db.select().from(events).where(eq(events.id, id));
  if (!event) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Skanuj bilety</h1>
          <p className="text-sm text-gray-500">{event.title}</p>
        </div>
        <Link
          href={`/organizer/events/${event.id}`}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Wróć do wydarzenia
        </Link>
      </div>

      <QrScanner eventId={event.id} />
    </div>
  );
}
