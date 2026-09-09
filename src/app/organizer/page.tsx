import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";

export default async function OrganizerEventsPage() {
  const allEvents = await db
    .select()
    .from(events)
    .orderBy(desc(events.startsAt));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Wydarzenia</h1>
        <Link
          href="/organizer/events/new"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          + Nowe wydarzenie
        </Link>
      </div>

      {allEvents.length === 0 ? (
        <p className="text-sm text-gray-500">Brak wydarzeń. Utwórz pierwsze.</p>
      ) : (
        <ul className="divide-y rounded border bg-white">
          {allEvents.map((event) => (
            <li key={event.id}>
              <Link
                href={`/organizer/events/${event.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.startsAt).toLocaleString("pl-PL")} ·{" "}
                    {event.location || "brak lokalizacji"}
                  </p>
                </div>
                <span className="text-sm text-gray-400">
                  limit: {event.capacity}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
