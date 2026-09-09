import { TicketLookupForm } from "@/components/ticket-lookup-form";

export default function TicketLookupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-center text-xl font-semibold">Mój bilet</h1>
      <TicketLookupForm />
    </div>
  );
}
