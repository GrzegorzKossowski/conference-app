import { notFound } from "next/navigation";
import { and, eq, inArray, count } from "drizzle-orm";
import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import { RegistrationForm } from "@/components/registration-form";
import { HomeLink } from "@/components/home-link";

const ACTIVE_STATUSES = ["pending", "confirmed", "checked_in"] as const;

export default async function EventLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [event] = await db.select().from(events).where(eq(events.slug, slug));
  if (!event) notFound();

  const [{ total: activeCount }] = await db
    .select({ total: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, event.id),
        inArray(registrations.status, ACTIVE_STATUSES),
      ),
    );
  const spotsLeft = event.capacity - activeCount;
  const isFull = spotsLeft <= 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6">
        <HomeLink />
      </div>
      <h1 className="text-2xl font-semibold">{event.title}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {new Date(event.startsAt).toLocaleString("pl-PL")}
        {event.location ? ` · ${event.location}` : ""}
      </p>
      {event.description && <p className="mt-4">{event.description}</p>}

      <div className="mt-8">
        {isFull ? (
          <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            Brak wolnych miejsc na to wydarzenie.
          </p>
        ) : (
          <>
            <h2 className="mb-3 text-lg font-medium">Zapisz się</h2>
            <RegistrationForm eventSlug={event.slug} />
          </>
        )}
      </div>
    </div>
  );
}
