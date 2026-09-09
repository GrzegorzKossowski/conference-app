import Link from "next/link";
import { headers } from "next/headers";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { generateQrDataUrl } from "@/lib/qr";

// No dynamic route segment, so force per-request rendering instead of
// Next caching the events list at build time.
export const dynamic = "force-dynamic";

async function getLoginUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}/organizer/login`;
}

export default async function Home() {
  const allEvents = await db.select().from(events).orderBy(asc(events.startsAt));
  const loginUrl = await getLoginUrl();
  const loginQr = await generateQrDataUrl(loginUrl);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Wydarzenia</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <Link href="/ticket" className="hover:text-black">
              Mam już bilet
            </Link>
            <Link href="/organizer/login" className="hover:text-black">
              Logowanie dla organizatorów
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 self-start rounded border bg-white p-2 sm:self-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={loginQr} width={88} height={88} alt="QR do logowania organizatora" />
          <p className="max-w-25 text-center text-[10px] text-gray-400">
            Zeskanuj → logowanie na telefonie
          </p>
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
