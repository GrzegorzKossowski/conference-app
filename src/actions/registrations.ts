"use server";

import { z } from "zod";
import { and, eq, inArray, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events, registrations } from "@/db/schema";
import { generateShortCode, generateConfirmToken } from "@/lib/codes";

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

  let attemptsLeft = 3;
  let createdShortCode: string | null = null;
  while (attemptsLeft > 0 && !createdShortCode) {
    attemptsLeft--;
    const shortCode = generateShortCode();
    try {
      await db.insert(registrations).values({
        eventId: event.id,
        email: data.email,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        status: "pending",
        shortCode,
        confirmToken: generateConfirmToken(),
        confirmTokenExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      });
      createdShortCode = shortCode;
    } catch (err) {
      if (err instanceof Error && err.message.includes("unique") && attemptsLeft > 0) {
        continue; // shortCode collision, retry with a fresh one
      }
      throw err;
    }
  }

  if (!createdShortCode) {
    return { error: "Nie udało się utworzyć rejestracji, spróbuj ponownie" };
  }

  // TODO(next step): send the confirmation email via Resend.

  redirect(`/event/${data.eventSlug}/success`);
}
