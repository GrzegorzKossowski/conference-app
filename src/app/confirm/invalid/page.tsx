export default function InvalidConfirmationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">Link nieprawidłowy lub wygasł</h1>
      <p className="mt-4 text-gray-600">
        Ten link potwierdzający jest nieaktualny. Jeśli nadal chcesz wziąć
        udział w wydarzeniu, zapisz się ponownie.
      </p>
    </div>
  );
}
