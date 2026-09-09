import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import { sendTicketEmail, isEmailConfigured } from "@/lib/email";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/confirm/invalid", request.url));
  }

  const [registration] = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.confirmToken, token),
        gt(registrations.confirmTokenExpiresAt, new Date()),
      ),
    );

  if (!registration) {
    return NextResponse.redirect(new URL("/confirm/invalid", request.url));
  }

  if (registration.status !== "pending") {
    // Already confirmed (link reused) — send them straight to their ticket.
    return NextResponse.redirect(
      new URL(`/ticket/${registration.shortCode}`, request.url),
    );
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, registration.eventId));
  if (!event) {
    return NextResponse.redirect(new URL("/confirm/invalid", request.url));
  }

  await db
    .update(registrations)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
      confirmToken: null,
    })
    .where(eq(registrations.id, registration.id));

  const ticketUrl = `${env.NEXT_PUBLIC_APP_URL}/ticket/${registration.shortCode}`;
  await sendTicketEmail({
    to: registration.email,
    eventTitle: event.title,
    shortCode: registration.shortCode,
    ticketUrl,
    qrPayload: registration.id,
  });

  if (!isEmailConfigured) {
    return NextResponse.redirect(
      new URL(`/dev/mail/${registration.id}`, request.url),
    );
  }

  return NextResponse.redirect(
    new URL(`/ticket/${registration.shortCode}`, request.url),
  );
}
