import { HomeLink } from "@/components/home-link";

export default function RegistrationSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <div className="mb-6 text-left">
        <HomeLink />
      </div>
      <h1 className="text-2xl font-semibold">Sprawdź swoją skrzynkę email</h1>
      <p className="mt-4 text-gray-600">
        Wysłaliśmy Ci link potwierdzający zapis. Kliknij go, aby otrzymać
        bilet z kodem QR.
      </p>
    </div>
  );
}
