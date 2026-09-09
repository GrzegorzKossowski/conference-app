import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function OrganizerLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-center text-xl font-semibold">
        Logowanie organizatora
      </h1>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
