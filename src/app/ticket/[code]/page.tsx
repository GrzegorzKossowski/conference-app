import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import { generateQrDataUrl } from "@/lib/qr";
import { HomeLink } from "@/components/home-link";
import { registrationStatusLabels } from "@/lib/status-labels";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.shortCode, code.toUpperCase()));
  if (!registration) notFound();

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, registration.eventId));
  if (!event) notFound();

  const qrImageSrc = await generateQrDataUrl(registration.id);

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <div className="mb-6 text-left">
        <HomeLink />
      </div>
      <h1 className="text-xl font-semibold">{event.title}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {new Date(event.startsAt).toLocaleString("pl-PL")}
        {event.location ? ` · ${event.location}` : ""}
      </p>

      <div className="mt-6 rounded border bg-white p-6">
        {registration.status === "pending" ? (
          <p className="rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            Rejestracja oczekuje na potwierdzenie — kod QR pojawi się po
            potwierdzeniu zapisu.
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrImageSrc}
            width={240}
            height={240}
            alt="Kod QR biletu"
            className="mx-auto"
          />
        )}
        <p className="mt-4 text-sm">
          Status:{" "}
          <strong>
            {registrationStatusLabels[registration.status] ?? registration.status}
          </strong>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Twój kod dostępu: <strong>{registration.shortCode}</strong>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Zapisz ten kod, żeby ponownie wyświetlić bilet na /ticket
        </p>
      </div>
    </div>
  );
}
