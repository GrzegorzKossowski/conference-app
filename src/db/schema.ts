import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending", // created, confirmation email sent, not yet confirmed
  "confirmed", // confirmed via double opt-in link, ticket/QR email sent
  "cancelled", // cancelled by the organizer
  "expired", // confirmation link expired / never confirmed
  "checked_in", // scanned at the door
]);

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const registrations = pgTable(
  "registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(), // this is what the QR code encodes
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    status: registrationStatusEnum("status").notNull().default("pending"),
    shortCode: text("short_code").notNull().unique(), // attendee login key, e.g. "43DR6H2"
    confirmToken: text("confirm_token").unique(), // opaque, single-use, nulled after confirmation
    confirmTokenExpiresAt: timestamp("confirm_token_expires_at", {
      withTimezone: true,
    }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("registrations_event_email_idx").on(
      table.eventId,
      table.email,
    ),
  ],
);
