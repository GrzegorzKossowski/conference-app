import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { registrations } from "@/db/schema";
import { auth } from "@/lib/auth";

const checkinSchema = z.object({
  registrationId: z.string().uuid(),
  eventId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ result: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ result: "invalid" });
  }
  const { registrationId, eventId } = parsed.data;

  const [registration] = await db
    .select()
    .from(registrations)
    .where(
      and(
        eq(registrations.id, registrationId),
        eq(registrations.eventId, eventId),
      ),
    );

  if (!registration) {
    return NextResponse.json({ result: "not_found" });
  }

  if (registration.status === "checked_in") {
    return NextResponse.json({
      result: "already_checked_in",
      registration: {
        email: registration.email,
        name: [registration.firstName, registration.lastName]
          .filter(Boolean)
          .join(" "),
        checkedInAt: registration.checkedInAt,
      },
    });
  }

  if (registration.status === "pending") {
    return NextResponse.json({ result: "not_confirmed" });
  }

  if (registration.status === "cancelled" || registration.status === "expired") {
    return NextResponse.json({
      result: "invalid_status",
      status: registration.status,
    });
  }

  // registration.status === "confirmed" here — conditional update guards
  // against a race if the same QR is scanned on two devices at once.
  const updated = await db
    .update(registrations)
    .set({ status: "checked_in", checkedInAt: new Date() })
    .where(
      and(eq(registrations.id, registrationId), eq(registrations.status, "confirmed")),
    )
    .returning({ id: registrations.id });

  if (updated.length === 0) {
    return NextResponse.json({ result: "already_checked_in" });
  }

  return NextResponse.json({
    result: "success",
    registration: {
      email: registration.email,
      name: [registration.firstName, registration.lastName]
        .filter(Boolean)
        .join(" "),
    },
  });
}
