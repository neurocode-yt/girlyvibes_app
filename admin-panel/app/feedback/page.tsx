import { revalidatePath } from "next/cache";
import { AdminError } from "@/components/AdminError";
import { AdminShell } from "@/components/AdminShell";
import { SubmitButton } from "@/components/SubmitButton";
import { formatDate } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Feedback = {
  id: string;
  type: string | null;
  message: string;
  status: string | null;
  app_version: string | null;
  created_at: string | null;
};

async function updateFeedbackStatus(formData: FormData) {
  "use server";
  const supabaseAdmin = getSupabaseAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!["new", "reviewed", "closed"].includes(status)) throw new Error("Invalid status.");

  const { error } = await supabaseAdmin.from("feedback").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/feedback");
}

async function getFeedback() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("feedback")
    .select("id,type,message,status,app_version,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data || []) as Feedback[];
}

export default async function FeedbackPage() {
  const result = await getFeedback().then(
    (feedback) => ({ feedback, error: null }),
    (error: unknown) => ({ feedback: [] as Feedback[], error }),
  );

  if (result.error) {
    return (
      <AdminShell title="Feedback">
        <AdminError error={result.error} />
      </AdminShell>
    );
  }

  const feedback = result.feedback;

  return (
    <AdminShell title="Feedback">
      <section className="overflow-x-auto rounded-2xl border border-pink-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-pink-100 text-sm">
          <thead className="bg-pink-50 text-left text-xs uppercase tracking-wide text-pink-700">
            <tr>
              {["type", "message", "status", "app version", "created", "update"].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {feedback.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="px-4 py-3">{item.type}</td>
                <td className="max-w-xl px-4 py-3 leading-6">{item.message}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">{item.app_version || "-"}</td>
                <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                <td className="px-4 py-3">
                  <form action={updateFeedbackStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <select name="status" defaultValue={item.status || "new"} className="rounded-lg border border-pink-100 px-3 py-2">
                      <option value="new">new</option>
                      <option value="reviewed">reviewed</option>
                      <option value="closed">closed</option>
                    </select>
                    <SubmitButton>Update</SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
