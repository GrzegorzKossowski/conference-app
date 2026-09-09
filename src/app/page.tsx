import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";

// No dynamic route segment, so force per-request rendering instead of
// Next caching the events list at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const allEvents = await db.select().from(events).orderBy(asc(events.startsAt));

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Wydarzenia</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/ticket" className="hover:text-black">
            Mam już bilet
          </Link>
          <Link href="/organizer/login" className="hover:text-black">
            Logowanie dla organizatorów
          </Link>
        </div>
      </div>

      {allEvents.length === 0 ? (
        <p className="text-sm text-gray-500">Brak zaplanowanych wydarzeń.</p>
      ) : (
        <ul className="divide-y rounded border bg-white">
          {allEvents.map((event) => (
            <li key={event.id}>
              <Link
                href={`/event/${event.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.startsAt).toLocaleString("pl-PL")}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
                <span className="text-sm text-gray-400">Zapisz się →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
