import { revalidatePath } from "next/cache";
import { AdminError } from "@/components/AdminError";
import { AdminShell } from "@/components/AdminShell";
import { SubmitButton } from "@/components/SubmitButton";
import { formatDate, stringifyJson } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Notification = {
  id: string;
  title: string;
  body: string;
  data: unknown;
  target_type: string | null;
  target_language: string | null;
  status: string | null;
  scheduled_at: string | null;
  created_at: string | null;
};

async function createNotification(formData: FormData) {
  "use server";
  const supabaseAdmin = getSupabaseAdmin();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const targetType = String(formData.get("target_type") || "all");
  const targetLanguage = String(formData.get("target_language") || "").trim() || null;
  const rawData = String(formData.get("data") || "{}").trim() || "{}";

  if (!["all", "language", "user"].includes(targetType)) throw new Error("Invalid target type.");
  const data = JSON.parse(rawData) as Record<string, unknown>;

  const { error } = await supabaseAdmin.from("notifications").insert({
    title,
    body,
    data,
    target_type: targetType,
    target_language: targetLanguage,
    status: "draft",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/notifications");
  revalidatePath("/");
}

async function getNotifications() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("id,title,body,data,target_type,target_language,status,scheduled_at,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data || []) as Notification[];
}

export default async function NotificationsPage() {
  const result = await getNotifications().then(
    (notifications) => ({ notifications, error: null }),
    (error: unknown) => ({ notifications: [] as Notification[], error }),
  );

  if (result.error) {
    return (
      <AdminShell title="Notifications">
        <AdminError error={result.error} />
      </AdminShell>
    );
  }

  const notifications = result.notifications;

  return (
    <AdminShell title="Notifications">
      <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-stone-950">Create draft notification</h2>
        <p className="mt-2 text-sm text-stone-500">
          TODO: Actual Firebase sending should be implemented in a secure server route or Supabase Edge Function with server-only credentials.
        </p>
        <form action={createNotification} className="mt-4 grid gap-3">
          <input name="title" required placeholder="Title" className="rounded-lg border border-pink-100 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400" />
          <textarea name="body" required placeholder="Body" rows={3} className="rounded-lg border border-pink-100 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400" />
          <div className="grid gap-3 md:grid-cols-2">
            <select name="target_type" defaultValue="all" className="rounded-lg border border-pink-100 px-3 py-2">
              <option value="all">all</option>
              <option value="language">language</option>
              <option value="user">user</option>
            </select>
            <select name="target_language" defaultValue="" className="rounded-lg border border-pink-100 px-3 py-2">
              <option value="">No language filter</option>
              <option value="ar">Arabic</option>
              <option value="en">English</option>
            </select>
          </div>
          <textarea name="data" defaultValue="{}" rows={4} className="rounded-lg border border-pink-100 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-pink-400" />
          <SubmitButton>Create draft</SubmitButton>
        </form>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-pink-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-pink-100 text-sm">
          <thead className="bg-pink-50 text-left text-xs uppercase tracking-wide text-pink-700">
            <tr>
              {["title", "body", "target", "language", "status", "data", "created"].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {notifications.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="px-4 py-3 font-semibold">{item.title}</td>
                <td className="max-w-md px-4 py-3 leading-6">{item.body}</td>
                <td className="px-4 py-3">{item.target_type}</td>
                <td className="px-4 py-3">{item.target_language || "-"}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">
                  <pre className="max-w-xs overflow-x-auto rounded-lg bg-pink-50 p-2 text-xs">{stringifyJson(item.data)}</pre>
                </td>
                <td className="px-4 py-3">{formatDate(item.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
