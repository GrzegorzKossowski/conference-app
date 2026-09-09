import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { updateEvent } from "@/actions/events";
import { EventForm } from "@/components/event-form";

function toLocalInputValue(date: Date | null): string | undefined {
  if (!date) return undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event] = await db.select().from(events).where(eq(events.id, id));
  if (!event) notFound();

  const boundUpdate = updateEvent.bind(null, event.id);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Edytuj: {event.title}</h1>
      <EventForm
        action={boundUpdate}
        submitLabel="Zapisz zmiany"
        defaultValues={{
          title: event.title,
          slug: event.slug,
          description: event.description ?? undefined,
          location: event.location ?? undefined,
          startsAt: toLocalInputValue(event.startsAt),
          endsAt: toLocalInputValue(event.endsAt),
          capacity: event.capacity,
        }}
      />
    </div>
  );
}
