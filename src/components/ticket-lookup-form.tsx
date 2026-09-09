"use client";

import { useActionState } from "react";
import { lookupTicketByCode, type LookupTicketState } from "@/actions/registrations";

const initialState: LookupTicketState = {};

export function TicketLookupForm() {
  const [state, formAction, pending] = useActionState(
    lookupTicketByCode,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded border bg-white p-6">
      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Twój kod dostępu
        </label>
        <input
          name="code"
          required
          placeholder="np. 43DR6H2Q"
          className="w-full rounded border px-3 py-2 uppercase"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Szukam..." : "Pokaż mój bilet"}
      </button>
    </form>
  );
}
