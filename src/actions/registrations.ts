"use server";

import { z } from "zod";
import { and, eq, inArray, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import { generateShortCode, generateConfirmToken } from "@/lib/codes";
import { sendConfirmationEmail, isEmailConfigured } from "@/lib/email";
import { env } from "@/lib/env";

const registerSchema = z.object({
  eventSlug: z.string().min(1),
  email: z.string().trim().toLowerCase().email("Podaj poprawny adres email"),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
});

export type RegisterState = {
  error?: string;
};

const ACTIVE_STATUSES = ["pending", "confirmed", "checked_in"] as const;

export async function registerForEvent(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    eventSlug: formData.get("eventSlug")?.toString(),
    email: formData.get("email")?.toString(),
    firstName: formData.get("firstName")?.toString(),
    lastName: formData.get("lastName")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" };
  }
  const data = parsed.data;

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.slug, data.eventSlug));
  if (!event) {
    return { error: "Nie znaleziono wydarzenia" };
  }

  const [existing] = await db
    .select({ id: registrations.id, status: registrations.status })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, event.id),
        eq(registrations.email, data.email),
      ),
    );
  if (
    existing &&
    (ACTIVE_STATUSES as readonly string[]).includes(existing.status)
  ) {
    return { error: "Ten adres email jest już zapisany na to wydarzenie" };
  }

  const [{ total: activeCount }] = await db
    .select({ total: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, event.id),
        inArray(registrations.status, ACTIVE_STATUSES),
      ),
    );
  if (activeCount >= event.capacity) {
    return { error: "Brak wolnych miejsc na to wydarzenie" };
  }

  // Without Resend configured we skip double opt-in entirely: registering
  // confirms immediately and the short code becomes the attendee's ticket
  // login. With Resend configured, double opt-in kicks back in (pending +
  // email confirmation link) — see /api/confirm.
  const skipDoubleOptIn = !isEmailConfigured;

  let attemptsLeft = 3;
  let created: { id: string; shortCode: string; confirmToken: string | null } | null =
    null;
  while (attemptsLeft > 0 && !created) {
    attemptsLeft--;
    const shortCode = generateShortCode();
    const confirmToken = skipDoubleOptIn ? null : generateConfirmToken();
    try {
      const [row] = await db
        .insert(registrations)
        .values({
          eventId: event.id,
          email: data.email,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          status: skipDoubleOptIn ? "confirmed" : "pending",
          confirmedAt: skipDoubleOptIn ? new Date() : null,
          shortCode,
          confirmToken,
          confirmTokenExpiresAt: skipDoubleOptIn
            ? null
            : new Date(Date.now() + 48 * 60 * 60 * 1000),
        })
        .returning({ id: registrations.id });
      created = { id: row.id, shortCode, confirmToken };
    } catch (err) {
      if (err instanceof Error && err.message.includes("unique") && attemptsLeft > 0) {
        continue; // shortCode collision, retry with a fresh one
      }
      throw err;
    }
  }

  if (!created) {
    return { error: "Nie udało się utworzyć rejestracji, spróbuj ponownie" };
  }

  if (skipDoubleOptIn) {
    redirect(`/ticket/${created.shortCode}`);
  }

  const confirmUrl = `${env.NEXT_PUBLIC_APP_URL}/api/confirm?token=${created.confirmToken}`;
  await sendConfirmationEmail({
    to: data.email,
    eventTitle: event.title,
    confirmUrl,
  });

  redirect(`/event/${data.eventSlug}/success`);
}

const lookupSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Podaj kod"),
});

export type LookupTicketState = {
  error?: string;
};

export async function lookupTicketByCode(
  _prevState: LookupTicketState,
  formData: FormData,
): Promise<LookupTicketState> {
  const parsed = lookupSchema.safeParse({ code: formData.get("code")?.toString() });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nieprawidłowy kod" };
  }

  const [registration] = await db
    .select({ shortCode: registrations.shortCode })
    .from(registrations)
    .where(eq(registrations.shortCode, parsed.data.code));

  if (!registration) {
    return { error: "Nie znaleziono biletu dla tego kodu" };
  }

  redirect(`/ticket/${registration.shortCode}`);
}
