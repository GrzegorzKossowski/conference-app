import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc, count } from "drizzle-orm";
import { db } from "@/db";
import { events, registrations } from "@/db/schema";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [event] = await db.select().from(events).where(eq(events.id, id));
  if (!event) notFound();

  const guests = await db
    .select()
    .from(registrations)
    .where(eq(registrations.eventId, id))
    .orderBy(desc(registrations.createdAt));

  const statusCounts = await db
    .select({ status: registrations.status, total: count() })
    .from(registrations)
    .where(eq(registrations.eventId, id))
    .groupBy(registrations.status);

  const countFor = (status: string) =>
    statusCounts.find((s) => s.status === status)?.total ?? 0;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{event.title}</h1>
          <p className="text-sm text-gray-500">
            {new Date(event.startsAt).toLocaleString("pl-PL")} ·{" "}
            {event.location || "brak lokalizacji"} · limit {event.capacity}
          </p>
          <p className="mt-1 text-sm text-gray-400">/event/{event.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/organizer/events/${event.id}/scan`}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            Skanuj bilety
          </Link>
          <Link
            href={`/organizer/events/${event.id}/edit`}
            className="rounded border px-4 py-2 text-sm"
          >
            Edytuj
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-5 gap-3">
        <Stat label="Wszyscy" value={guests.length} />
        <Stat label="Oczekujący" value={countFor("pending")} />
        <Stat label="Potwierdzeni" value={countFor("confirmed")} />
        <Stat label="Obecni" value={countFor("checked_in")} />
        <Stat label="Anulowani/wygasli" value={countFor("cancelled") + countFor("expired")} />
      </div>

      <h2 className="mb-2 text-lg font-medium">Goście</h2>
      {guests.length === 0 ? (
        <p className="text-sm text-gray-500">Brak zapisanych gości.</p>
      ) : (
        <div className="overflow-x-auto rounded border bg-white">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Imię i nazwisko</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Zapisano</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <tr key={g.id} className="border-b last:border-0">
                  <td className="px-3 py-2">{g.email}</td>
                  <td className="px-3 py-2">
                    {[g.firstName, g.lastName].filter(Boolean).join(" ") ||
                      "—"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={g.status} />
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {new Date(g.createdAt).toLocaleString("pl-PL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border bg-white px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  checked_in: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  expired: "bg-red-50 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs ${statusStyles[status] ?? ""}`}
    >
      {status}
    </span>
  );
}
