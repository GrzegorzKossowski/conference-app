"use client";

import { useActionState } from "react";
import { registerForEvent, type RegisterState } from "@/actions/registrations";

const initialState: RegisterState = {};

export function RegistrationForm({ eventSlug }: { eventSlug: string }) {
  const [state, formAction, pending] = useActionState(
    registerForEvent,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded border bg-white p-6">
      <input type="hidden" name="eventSlug" value={eventSlug} />

      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Email *</label>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Imię</label>
          <input name="firstName" className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Nazwisko</label>
          <input name="lastName" className="w-full rounded border px-3 py-2" />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Zapisywanie..." : "Zapisz się"}
      </button>
    </form>
  );
}
