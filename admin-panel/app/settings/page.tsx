import { revalidatePath } from "next/cache";
import { AdminError } from "@/components/AdminError";
import { AdminShell } from "@/components/AdminShell";
import { SubmitButton } from "@/components/SubmitButton";
import { stringifyJson } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type AppSetting = {
  key: string;
  value: unknown;
  updated_at: string | null;
};

async function updateSetting(formData: FormData) {
  "use server";
  const supabaseAdmin = getSupabaseAdmin();
  const key = String(formData.get("key") || "").trim();
  const rawValue = String(formData.get("value") || "").trim();

  try {
    const value = JSON.parse(rawValue);
    const { error } = await supabaseAdmin.from("app_settings").upsert({ key, value }, { onConflict: "key" });
    if (error) throw new Error(error.message);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON.";
    throw new Error(`Could not save setting: ${message}`);
  }

  revalidatePath("/settings");
}

async function getSettings() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from("app_settings").select("key,value,updated_at").order("key");
  if (error) throw new Error(error.message);
  return (data || []) as AppSetting[];
}

export default async function SettingsPage() {
  const result = await getSettings().then(
    (settings) => ({ settings, error: null }),
    (error: unknown) => ({ settings: [] as AppSetting[], error }),
  );

  if (result.error) {
    return (
      <AdminShell title="App Settings">
        <AdminError error={result.error} />
      </AdminShell>
    );
  }

  const settings = result.settings;

  return (
    <AdminShell title="App Settings">
      <section className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-stone-950">Create or update setting</h2>
        <form action={updateSetting} className="mt-4 grid gap-3">
          <input name="key" placeholder="setting_key" required className="rounded-lg border border-pink-100 px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400" />
          <textarea name="value" placeholder="{ }" required rows={5} className="rounded-lg border border-pink-100 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-pink-400" />
          <SubmitButton>Save JSON setting</SubmitButton>
        </form>
      </section>

      <section className="mt-6 grid gap-4">
        {settings.map((setting) => (
          <form key={setting.key} action={updateSetting} className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <input type="hidden" name="key" value={setting.key} />
            <h3 className="font-mono text-sm font-bold text-pink-700">{setting.key}</h3>
            <textarea
              name="value"
              defaultValue={stringifyJson(setting.value)}
              rows={8}
              className="mt-3 w-full rounded-lg border border-pink-100 px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-pink-400"
            />
            <div className="mt-3">
              <SubmitButton>Update setting</SubmitButton>
            </div>
          </form>
        ))}
      </section>
    </AdminShell>
  );
}
