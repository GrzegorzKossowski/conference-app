import { TicketLookupForm } from "@/components/ticket-lookup-form";
import { HomeLink } from "@/components/home-link";

export default function TicketLookupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-6">
        <HomeLink />
      </div>
      <h1 className="mb-6 text-center text-xl font-semibold">Mój bilet</h1>
      <TicketLookupForm />
    </div>
  );
}
