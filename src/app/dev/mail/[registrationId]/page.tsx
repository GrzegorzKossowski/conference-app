import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { render } from "@react-email/components";
import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import { env } from "@/lib/env";
import { generateQrDataUrl } from "@/lib/qr";
import { ConfirmRegistrationEmail } from "@/emails/confirm-registration";
import { TicketReadyEmail } from "@/emails/ticket-ready";

export default async function DevMailPreviewPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;

  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId));
  if (!registration) notFound();

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, registration.eventId));
  if (!event) notFound();

  let subject: string;
  let html: string;

  if (registration.status === "pending" && registration.confirmToken) {
    const confirmUrl = `${env.NEXT_PUBLIC_APP_URL}/api/confirm?token=${registration.confirmToken}`;
    subject = `Potwierdź zapis: ${event.title}`;
    html = await render(
      ConfirmRegistrationEmail({ eventTitle: event.title, confirmUrl }),
    );
  } else {
    const ticketUrl = `${env.NEXT_PUBLIC_APP_URL}/ticket/${registration.shortCode}`;
    const qrImageSrc = await generateQrDataUrl(registration.id);
    subject = `Twój bilet: ${event.title}`;
    html = await render(
      TicketReadyEmail({
        eventTitle: event.title,
        shortCode: registration.shortCode,
        ticketUrl,
        qrImageSrc,
      }),
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">Podgląd maila (tryb dev)</p>
        <p>
          RESEND_API_KEY nie jest ustawiony, więc żaden prawdziwy mail nie
          został wysłany do <strong>{registration.email}</strong> — poniżej
          widzisz dokładnie to, co by w nim było, z działającymi linkami.
        </p>
      </div>
      <p className="mb-2 text-sm text-gray-500">Temat: {subject}</p>
      <iframe
        title="Podgląd emaila"
        srcDoc={html}
        className="h-[700px] w-full rounded border bg-white"
      />
    </div>
  );
}
