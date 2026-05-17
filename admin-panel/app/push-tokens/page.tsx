import { AdminError } from "@/components/AdminError";
import { AdminShell } from "@/components/AdminShell";
import { formatDate, maskToken } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type PushToken = {
  id: string;
  token: string | null;
  platform: string | null;
  language: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

function groupTokens(tokens: PushToken[]) {
  const groups = new Map<string, { platform: string; language: string; is_active: boolean; count: number }>();
  for (const token of tokens) {
    const platform = token.platform || "unknown";
    const language = token.language || "unknown";
    const isActive = token.is_active ?? false;
    const key = `${platform}:${language}:${isActive}`;
    const existing = groups.get(key);
    if (existing) existing.count += 1;
    else groups.set(key, { platform, language, is_active: isActive, count: 1 });
  }
  return Array.from(groups.values());
}

async function getTokens() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("push_tokens")
    .select("id,token,platform,language,is_active,created_at,updated_at")
    .order("updated_at", { ascending: false })
    .limit(250);
  if (error) throw new Error(error.message);
  return (data || []) as PushToken[];
}

export default async function PushTokensPage() {
  const result = await getTokens().then(
    (tokens) => ({ tokens, error: null }),
    (error: unknown) => ({ tokens: [] as PushToken[], error }),
  );

  if (result.error) {
    return (
      <AdminShell title="Push Tokens">
        <AdminError error={result.error} />
      </AdminShell>
    );
  }

  const tokens = result.tokens;
  const groups = groupTokens(tokens);

  return (
    <AdminShell title="Push Tokens">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <div key={`${group.platform}-${group.language}-${group.is_active}`} className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-pink-700">{group.platform} / {group.language}</p>
            <p className="mt-2 text-3xl font-bold">{group.count}</p>
            <p className="mt-1 text-sm text-stone-500">{group.is_active ? "Active" : "Inactive"}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-pink-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-pink-100 text-sm">
          <thead className="bg-pink-50 text-left text-xs uppercase tracking-wide text-pink-700">
            <tr>
              {["token", "platform", "language", "active", "created", "updated"].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {tokens.map((token) => (
              <tr key={token.id}>
                <td className="px-4 py-3 font-mono text-xs">{maskToken(token.token)}</td>
                <td className="px-4 py-3">{token.platform || "-"}</td>
                <td className="px-4 py-3">{token.language || "-"}</td>
                <td className="px-4 py-3">{token.is_active ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{formatDate(token.created_at)}</td>
                <td className="px-4 py-3">{formatDate(token.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
