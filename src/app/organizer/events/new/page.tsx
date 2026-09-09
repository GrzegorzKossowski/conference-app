import { createEvent } from "@/actions/events";
import { EventForm } from "@/components/event-form";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Nowe wydarzenie</h1>
      <EventForm action={createEvent} submitLabel="Utwórz wydarzenie" />
    </div>
  );
}
