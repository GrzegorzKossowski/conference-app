import { Resend } from "resend";
import { env } from "@/lib/env";
import { generateQrPngBuffer } from "@/lib/qr";
import { ConfirmRegistrationEmail } from "@/emails/confirm-registration";
import { TicketReadyEmail } from "@/emails/ticket-ready";

// Prototype mode: without a RESEND_API_KEY, "sending" an email just logs it
// and the app exposes a /dev/mail/[registrationId] page that renders what
// would have been sent, so the whole double opt-in flow is testable without
// a real inbox. Switches to real delivery automatically once the key is set.
export const isEmailConfigured = Boolean(env.RESEND_API_KEY);

function getClient() {
  return new Resend(env.RESEND_API_KEY);
}

export async function sendConfirmationEmail({
  to,
  eventTitle,
  confirmUrl,
}: {
  to: string;
  eventTitle: string;
  confirmUrl: string;
}) {
  if (!isEmailConfigured) {
    console.log(`[dev-mail] confirmation email to ${to} skipped (no RESEND_API_KEY) — see /dev/mail/*`);
    return;
  }
  await getClient().emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Potwierdź zapis: ${eventTitle}`,
    react: ConfirmRegistrationEmail({ eventTitle, confirmUrl }),
  });
}

export async function sendTicketEmail({
  to,
  eventTitle,
  shortCode,
  ticketUrl,
  qrPayload,
}: {
  to: string;
  eventTitle: string;
  shortCode: string;
  ticketUrl: string;
  qrPayload: string;
}) {
  if (!isEmailConfigured) {
    console.log(`[dev-mail] ticket email to ${to} skipped (no RESEND_API_KEY) — see /dev/mail/*`);
    return;
  }
  const qrBuffer = await generateQrPngBuffer(qrPayload);
  const qrCid = "ticket-qr";

  await getClient().emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: `Twój bilet: ${eventTitle}`,
    react: TicketReadyEmail({
      eventTitle,
      shortCode,
      ticketUrl,
      qrImageSrc: `cid:${qrCid}`,
    }),
    attachments: [
      {
        filename: "ticket-qr.png",
        content: qrBuffer,
        contentId: qrCid,
      },
    ],
  });
}
