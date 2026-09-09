"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events } from "@/db/schema";
import { slugify } from "@/lib/slug";

const eventFieldsSchema = z.object({
  title: z.string().trim().min(1, "Tytuł jest wymagany"),
  slug: z.string().trim().min(1, "Slug jest wymagany"),
  description: z.string().trim().optional(),
  location: z.string().trim().optional(),
  startsAt: z.string().min(1, "Data rozpoczęcia jest wymagana"),
  endsAt: z.string().optional(),
  capacity: z.coerce.number().int().positive("Pojemność musi być dodatnia"),
});

export type EventFormState = {
  error?: string;
};

function parseEventForm(formData: FormData) {
  const rawSlug = formData.get("slug")?.toString().trim();
  const rawTitle = formData.get("title")?.toString() ?? "";

  return eventFieldsSchema.safeParse({
    title: rawTitle,
    slug: rawSlug ? slugify(rawSlug) : slugify(rawTitle),
    description: formData.get("description")?.toString(),
    location: formData.get("location")?.toString(),
    startsAt: formData.get("startsAt")?.toString(),
    endsAt: formData.get("endsAt")?.toString() || undefined,
    capacity: formData.get("capacity")?.toString(),
  });
}

export async function createEvent(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" };
  }
  const data = parsed.data;

  let createdId: string;
  try {
    const [created] = await db
      .insert(events)
      .values({
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        location: data.location || null,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        capacity: data.capacity,
      })
      .returning({ id: events.id });
    createdId = created.id;
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { error: `Slug "${data.slug}" jest już zajęty` };
    }
    throw err;
  }

  redirect(`/organizer/events/${createdId}`);
}

export async function updateEvent(
  eventId: string,
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const parsed = parseEventForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane" };
  }
  const data = parsed.data;

  try {
    await db
      .update(events)
      .set({
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        location: data.location || null,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        capacity: data.capacity,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId));
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return { error: `Slug "${data.slug}" jest już zajęty` };
    }
    throw err;
  }

  redirect(`/organizer/events/${eventId}`);
}
