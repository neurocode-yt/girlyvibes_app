import { revalidatePath } from "next/cache";
import { AdminError } from "@/components/AdminError";
import { AdminShell } from "@/components/AdminShell";
import { SubmitButton } from "@/components/SubmitButton";
import { formatDate } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Activity = {
  id: string;
  sort_order: number | null;
  title: string | null;
  title_en: string | null;
  duration: string | null;
  duration_en: string | null;
  image_key: string | null;
  is_active: boolean | null;
  updated_at: string | null;
};

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

async function nextActivityDefaults() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from("activities").select("id,sort_order");
  if (error) throw new Error(error.message);
  const activities = (data || []) as Pick<Activity, "id" | "sort_order">[];
  const nextIdNumber = activities.reduce((max, activity) => {
    const match = activity.id.match(/^a(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;
  const nextSortOrder = activities.reduce((max, activity) => Math.max(max, activity.sort_order || 0), 0) + 1;
  return { id: `a${nextIdNumber}`, sortOrder: nextSortOrder };
}

async function createActivity(formData: FormData) {
  "use server";
  const supabaseAdmin = getSupabaseAdmin();
  const defaults = await nextActivityDefaults();
  const id = textValue(formData, "id") || defaults.id;
  const sortOrder = Number(textValue(formData, "sort_order") || defaults.sortOrder);
  const { error } = await supabaseAdmin.from("activities").insert({
    id,
    sort_order: sortOrder,
    title: textValue(formData, "title"),
    title_en: textValue(formData, "title_en"),
    duration: textValue(formData, "duration"),
    duration_en: textValue(formData, "duration_en"),
    image_key: textValue(formData, "image_key"),
    is_active: formData.get("is_active") === "on",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/activities");
  revalidatePath("/");
}

async function updateActivity(formData: FormData) {
  "use server";
  const supabaseAdmin = getSupabaseAdmin();
  const id = textValue(formData, "id");
  const { error } = await supabaseAdmin
    .from("activities")
    .update({
      sort_order: Number(textValue(formData, "sort_order") || "0"),
      title: textValue(formData, "title"),
      title_en: textValue(formData, "title_en"),
      duration: textValue(formData, "duration"),
      duration_en: textValue(formData, "duration_en"),
      image_key: textValue(formData, "image_key"),
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/activities");
}

async function deleteActivity(formData: FormData) {
  "use server";
  const supabaseAdmin = getSupabaseAdmin();
  const id = textValue(formData, "id");
  const { error } = await supabaseAdmin.from("activities").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/activities");
  revalidatePath("/");
}

async function getActivities() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("activities")
    .select("id,sort_order,title,title_en,duration,duration_en,image_key,is_active,updated_at")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []) as Activity[];
}

export default async function ActivitiesPage() {
  const result = await getActivities().then(
    (activities) => ({ activities, error: null }),
    (error: unknown) => ({ activities: [] as Activity[], error }),
  );

  if (result.error) {
    return (
      <AdminShell title="Activities">
        <AdminError error={result.error} />
      </AdminShell>
    );
  }

  const activities = result.activities;

  return (
    <AdminShell title="Activities">
      <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-stone-950">Create activity</h2>
        <form action={createActivity} className="mt-4 grid gap-3 md:grid-cols-4">
          {["id", "sort_order", "title", "title_en", "duration", "duration_en", "image_key"].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field === "id" ? "id (optional, auto a31)" : field === "sort_order" ? "sort_order (optional)" : field}
              required={field === "title" || field === "title_en"}
              className="rounded-lg border border-pink-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-400"
            />
          ))}
          <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <input name="is_active" type="checkbox" defaultChecked /> Active
          </label>
          <div className="md:col-span-4">
            <SubmitButton>Create activity</SubmitButton>
          </div>
        </form>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-pink-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-pink-100 text-sm">
          <thead className="bg-pink-50 text-left text-xs uppercase tracking-wide text-pink-700">
            <tr>
              {["id", "sort", "title", "title_en", "duration", "duration_en", "image_key", "active", "updated", "actions"].map((head) => (
                <th key={head} className="px-4 py-3 font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {activities.map((activity) => (
              <tr key={activity.id} className="align-top">
                <td className="px-4 py-3 font-mono text-xs">{activity.id}</td>
                <td className="px-4 py-3">{activity.sort_order}</td>
                <td className="px-4 py-3">{activity.title}</td>
                <td className="px-4 py-3">{activity.title_en}</td>
                <td className="px-4 py-3">{activity.duration}</td>
                <td className="px-4 py-3">{activity.duration_en}</td>
                <td className="px-4 py-3">{activity.image_key}</td>
                <td className="px-4 py-3">{activity.is_active ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{formatDate(activity.updated_at)}</td>
                <td className="px-4 py-3">
                  <form action={updateActivity} className="grid min-w-80 gap-2">
                    <input type="hidden" name="id" value={activity.id} />
                    <input name="sort_order" defaultValue={activity.sort_order ?? 0} className="rounded border border-pink-100 px-2 py-1" />
                    <input name="title" defaultValue={activity.title ?? ""} className="rounded border border-pink-100 px-2 py-1" />
                    <input name="title_en" defaultValue={activity.title_en ?? ""} className="rounded border border-pink-100 px-2 py-1" />
                    <input name="duration" defaultValue={activity.duration ?? ""} className="rounded border border-pink-100 px-2 py-1" />
                    <input name="duration_en" defaultValue={activity.duration_en ?? ""} className="rounded border border-pink-100 px-2 py-1" />
                    <input name="image_key" defaultValue={activity.image_key ?? ""} className="rounded border border-pink-100 px-2 py-1" />
                    <label className="flex items-center gap-2">
                      <input name="is_active" type="checkbox" defaultChecked={activity.is_active ?? false} /> Active
                    </label>
                    <div className="flex gap-2">
                      <SubmitButton>Save</SubmitButton>
                      <button formAction={deleteActivity} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
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
