import { isMissingSupabaseConfig } from "@/lib/adminErrors";

export function AdminError({ error }: { error: unknown }) {
  const isConfig = isMissingSupabaseConfig(error);

  return (
    <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
        {isConfig ? "Supabase configuration needed" : "Could not load data"}
      </p>
      <h2 className="mt-2 text-xl font-bold text-stone-950">
        {isConfig ? "Update admin-panel/.env.local" : "Supabase request failed"}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
        {isConfig
          ? "Set NEXT_PUBLIC_SUPABASE_URL to your project origin, plus real NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_PASSWORD values. Restart the admin dev server after changing env files."
          : "The admin panel could not reach Supabase or Supabase returned an error. Check your internet connection, Supabase project status, and server environment variables."}
      </p>
      <div className="mt-4 rounded-xl bg-pink-50 p-4 font-mono text-xs text-stone-700">
        NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
      </div>
    </div>
  );
}
