import Link from "next/link";
import { AdminError } from "@/components/AdminError";
import { AdminShell } from "@/components/AdminShell";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const countTables = ["activities", "feedback", "push_tokens", "notifications", "profiles"] as const;

const navCards = [
  { href: "/users", title: "Users", description: "Inspect user profile progress, notes, entries, and routines for database testing." },
  { href: "/reads", title: "Reads", description: "Publish and customize Read section content through app settings." },
  { href: "/activities", title: "Activities", description: "Manage boredom activities and visibility." },
  { href: "/notifications", title: "Notifications", description: "Create notification drafts for later sending." },
  { href: "/feedback", title: "Feedback", description: "Review user feedback without exposing extra profile data." },
  { href: "/settings", title: "App Settings", description: "Edit public JSON app settings safely." },
  { href: "/push-tokens", title: "Push Tokens", description: "Inspect grouped device token health." },
];

async function getCounts() {
  const supabaseAdmin = getSupabaseAdmin();
  const entries = await Promise.all(
    countTables.map(async (table) => {
      const { count, error } = await supabaseAdmin.from(table).select("*", { count: "exact", head: true });
      return [table, error ? "Error" : count ?? 0] as const;
    }),
  );

  return entries;
}

export default async function DashboardPage() {
  const result = await getCounts().then(
    (counts) => ({ counts, error: null }),
    (error: unknown) => ({ counts: [] as Awaited<ReturnType<typeof getCounts>>, error }),
  );

  if (result.error) {
    return (
      <AdminShell title="Admin Dashboard">
        <AdminError error={result.error} />
      </AdminShell>
    );
  }

  const counts = result.counts;

  return (
    <AdminShell title="Admin Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {counts.map(([table, count]) => (
          <div key={table} className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium capitalize text-stone-500">{table.replace("_", " ")}</p>
            <p className="mt-3 text-3xl font-bold text-pink-700">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {navCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-bold text-stone-950">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
