"use client";

import { useActionState } from "react";
import type { EventFormState } from "@/actions/events";

const initialState: EventFormState = {};

export type EventFormDefaults = {
  title?: string;
  slug?: string;
  description?: string;
  location?: string;
  startsAt?: string; // datetime-local value, e.g. 2026-05-01T18:00
  endsAt?: string;
  capacity?: number;
};

export function EventForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (
    prevState: EventFormState,
    formData: FormData,
  ) => Promise<EventFormState>;
  defaultValues?: EventFormDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded border bg-white p-6">
      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Tytuł *</label>
        <input
          name="title"
          required
          defaultValue={defaultValues?.title}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Slug (URL) — zostaw puste, wygeneruje się z tytułu
        </label>
        <input
          name="slug"
          defaultValue={defaultValues?.slug}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Opis</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Lokalizacja</label>
        <input
          name="location"
          defaultValue={defaultValues?.location}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Data rozpoczęcia *
          </label>
          <input
            type="datetime-local"
            name="startsAt"
            required
            defaultValue={defaultValues?.startsAt}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Data zakończenia
          </label>
          <input
            type="datetime-local"
            name="endsAt"
            defaultValue={defaultValues?.endsAt}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Maksymalna liczba gości *
        </label>
        <input
          type="number"
          name="capacity"
          min={1}
          required
          defaultValue={defaultValues?.capacity}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Zapisywanie..." : submitLabel}
      </button>
    </form>
  );
}
