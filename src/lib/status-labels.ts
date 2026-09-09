export const registrationStatusLabels: Record<string, string> = {
  pending: "Oczekuje na potwierdzenie",
  confirmed: "Potwierdzony",
  checked_in: "Obecny",
  cancelled: "Anulowany",
  expired: "Wygasł",
};

export const registrationStatusStyles: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  checked_in: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  expired: "bg-red-50 text-red-700",
};
