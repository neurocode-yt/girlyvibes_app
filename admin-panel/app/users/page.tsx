import Link from "next/link";
import { AdminError } from "@/components/AdminError";
import { AdminShell } from "@/components/AdminShell";
import { formatDate } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  name: string | null;
  language: string | null;
  streak: number | null;
  total_routines_completed: number | null;
  last_streak_date: string | null;
  updated_at: string | null;
  created_at: string | null;
};

type UserSummary = ProfileRow & {
  noteCount: number;
  entryCount: number;
  routineCount: number;
};

async function getUsers() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id,name,language,streak,total_routines_completed,last_streak_date,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  const profiles = (data || []) as ProfileRow[];
  return Promise.all(
    profiles.map(async (profile) => {
      const [notes, entries, routines] = await Promise.all([
        supabaseAdmin.from("diary_notes").select("*", { count: "exact", head: true }).eq("user_id", profile.id).is("deleted_at", null),
        supabaseAdmin.from("diary_entries").select("*", { count: "exact", head: true }).eq("user_id", profile.id).is("deleted_at", null),
        supabaseAdmin.from("custom_routines").select("*", { count: "exact", head: true }).eq("user_id", profile.id).is("deleted_at", null),
      ]);

      return {
        ...profile,
        noteCount: notes.count ?? 0,
        entryCount: entries.count ?? 0,
        routineCount: routines.count ?? 0,
      } satisfies UserSummary;
    }),
  );
}

export default async function UsersPage() {
  const result = await getUsers().then(
    (users) => ({ users, error: null }),
    (error: unknown) => ({ users: [] as UserSummary[], error }),
  );

  if (result.error) {
    return (
      <AdminShell title="Users">
        <AdminError error={result.error} />
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Users">
      <section className="overflow-x-auto rounded-2xl border border-pink-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-pink-100 text-sm">
          <thead className="bg-pink-50 text-left text-xs uppercase tracking-wide text-pink-700">
            <tr>
              {["username", "user id", "language", "streak", "routines", "notes", "entries", "custom routines", "updated", "view"].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {result.users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-semibold text-stone-950">{user.name || "Unnamed user"}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-500">{user.id}</td>
                <td className="px-4 py-3">{user.language || "-"}</td>
                <td className="px-4 py-3">{user.streak ?? 0}</td>
                <td className="px-4 py-3">{user.total_routines_completed ?? 0}</td>
                <td className="px-4 py-3">{user.noteCount}</td>
                <td className="px-4 py-3">{user.entryCount}</td>
                <td className="px-4 py-3">{user.routineCount}</td>
                <td className="px-4 py-3">{formatDate(user.updated_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/users/${user.id}`} className="rounded-lg bg-pink-600 px-3 py-2 text-xs font-semibold text-white hover:bg-pink-700">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
