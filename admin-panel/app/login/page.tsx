import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-pink-50 px-4">
      <section className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-8 shadow-xl shadow-pink-100">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-pink-600">Girly Vibes</p>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">Admin Login</h1>
          <p className="mt-3 text-sm text-stone-500">Private dashboard access for app management.</p>
        </div>
        <Suspense fallback={<div className="text-sm text-stone-500">Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
