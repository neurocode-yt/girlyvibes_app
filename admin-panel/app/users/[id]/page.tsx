/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AdminError } from "@/components/AdminError";
import { AdminShell } from "@/components/AdminShell";
import { ImageLightboxButton } from "@/components/ImageLightboxButton";
import { NotePreviewGrid } from "@/components/NotePreviewGrid";
import { detoxLabels, glowPlanLabels, glowTaskLabel, prettyId, routineLabels } from "@/lib/appLabels";
import { formatDate } from "@/lib/format";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type JsonValue = unknown;
type JsonRecord = Record<string, unknown>;

type ProfileDetail = {
  id: string;
  name: string | null;
  avatar_url: string | null;
  language: string | null;
  streak: number | null;
  last_streak_date: string | null;
  total_routines_completed: number | null;
  favorite_routine_id: string | null;
  vision_board_image_url: string | null;
  vision_board_mode: string | null;
  favorite_advice: string[] | null;
  glow_up_progress: JsonValue;
  detox_challenge: JsonValue;
  routine_progress: JsonValue;
  completed_routines: JsonValue;
  last_routine_reset_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  avatarDisplayUrl?: string | null;
  visionBoardDisplayUrl?: string | null;
};

type RichBlock = {
  id?: string;
  text?: string;
  type?: string;
  imageUri?: string;
  imageStoragePath?: string;
  mediaBucket?: string;
};

type DiaryNote = {
  id: string;
  date_key: string;
  title: string | null;
  text_content: string | null;
  rich_content: RichBlock[] | null;
  color: string | null;
  created_at_ms: number | null;
  created_at: string | null;
  updated_at: string | null;
  renderedBlocks?: RichBlock[];
};

type DiaryEntry = {
  id: string;
  mood: string | null;
  mood_emoji: string | null;
  note: string | null;
  card_color: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type NoteMedia = {
  id: string;
  note_id: string;
  media_type: string;
  bucket: string;
  storage_path: string;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  duration_millis: number | null;
  created_at: string | null;
  displayUrl?: string | null;
};

type CustomRoutine = {
  id: string;
  title: string;
  title_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  icon: string | null;
  color: string | null;
  steps: JsonValue;
  created_at: string | null;
  updated_at: string | null;
};

function asRecord(value: JsonValue): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

async function signedStorageUrl(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}

function StatCard({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-pink-700">{value ?? "-"}</p>
    </div>
  );
}

function ImagePreview({ title, url, subtitle }: { title: string; url?: string | null; subtitle?: string | null }) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-stone-950">{title}</h2>
      {url ? (
        <ImageLightboxButton src={url} alt={title} className="mt-4 max-h-96 w-full rounded-xl object-cover" />
      ) : (
        <div className="mt-4 rounded-xl bg-pink-50 p-8 text-center text-sm text-stone-500">No image saved.</div>
      )}
      {subtitle ? <p className="mt-3 text-sm text-stone-500">{subtitle}</p> : null}
    </div>
  );
}

function ProgressSection({ profile }: { profile: ProfileDetail }) {
  const glow = asRecord(profile.glow_up_progress);
  const detox = asRecord(profile.detox_challenge);
  const routineProgress = asRecord(profile.routine_progress);
  const completedRoutines = asRecord(profile.completed_routines);
  const activePlanIds = asStringArray(glow.activePlanIds);
  const completedTasks = asRecord(glow.completedTasks);
  const checkedInDays = asStringArray(detox.checkedInDays);

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-stone-950">Glow Up Progress</h2>
        <p className="mt-2 text-sm text-stone-500">Started: {formatDate(String(glow.startDate || ""))}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(activePlanIds.length ? activePlanIds : asStringArray(glow.activePlanId ? [glow.activePlanId] : [])).map((planId) => (
            <span key={planId} className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-800">
              {glowPlanLabels[planId] || prettyId(planId)}
            </span>
          ))}
        </div>
        <div className="mt-4 grid gap-2">
          {Object.entries(completedTasks).filter(([, done]) => done === true).map(([task]) => (
            <div key={task} className="rounded-lg border border-pink-100 bg-pink-50 px-3 py-2 text-sm text-stone-700">
              {glowTaskLabel(task)}
            </div>
          ))}
          {Object.keys(completedTasks).length === 0 ? <p className="text-sm text-stone-500">No completed glow-up tasks yet.</p> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-stone-950">Detox Challenge</h2>
        <p className="mt-2 text-sm text-stone-500">Challenge: {detoxLabels[String(detox.challengeId || "")] || prettyId(String(detox.challengeId || "None"))}</p>
        <p className="mt-1 text-sm text-stone-500">Started: {formatDate(String(detox.startDate || ""))}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {checkedInDays.map((day) => (
            <span key={day} className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-800">{day}</span>
          ))}
          {checkedInDays.length === 0 ? <p className="text-sm text-stone-500">No check-ins yet.</p> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="text-lg font-bold text-stone-950">Routine Progress</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(routineProgress).map(([routineId, steps]) => {
            const label = routineLabels[routineId]?.title || prettyId(routineId);
            const stepMap = asRecord(steps);
            const completed = Object.entries(stepMap).filter(([, done]) => done === true);
            return (
              <div key={routineId} className="rounded-xl border border-pink-100 p-4">
                <p className="font-semibold text-stone-950">{label}</p>
                <div className="mt-3 grid gap-2">
                  {completed.map(([stepId]) => (
                    <div key={stepId} className="rounded-lg bg-pink-50 px-3 py-2 text-sm text-stone-700">
                      {routineLabels[routineId]?.steps[stepId] || prettyId(stepId)}
                    </div>
                  ))}
                  {completed.length === 0 ? <p className="text-sm text-stone-500">No completed steps.</p> : null}
                </div>
              </div>
            );
          })}
          {Object.keys(routineProgress).length === 0 ? <p className="text-sm text-stone-500">No routine progress saved.</p> : null}
        </div>
      </div>

      <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="text-lg font-bold text-stone-950">Completed Routines Today</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(completedRoutines).filter(([, done]) => done === true).map(([routineId]) => (
            <span key={routineId} className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-800">
              {routineLabels[routineId]?.title || prettyId(routineId)}
            </span>
          ))}
          {Object.keys(completedRoutines).length === 0 ? <p className="text-sm text-stone-500">No routine has been marked fully complete today.</p> : null}
        </div>
      </div>
    </section>
  );
}

function CustomRoutineCard({ routine }: { routine: CustomRoutine }) {
  const steps = Array.isArray(routine.steps) ? routine.steps as Array<{ id?: string; title?: string; titleEn?: string }> : [];
  return (
    <article className="rounded-xl border border-pink-100 p-4">
      <p className="font-semibold text-pink-700">{routine.title_en || routine.title}</p>
      {routine.subtitle_en || routine.subtitle ? <p className="mt-1 text-sm text-stone-500">{routine.subtitle_en || routine.subtitle}</p> : null}
      <ol className="mt-3 grid gap-2">
        {steps.map((step, index) => (
          <li key={step.id || index} className="rounded-lg bg-pink-50 px-3 py-2 text-sm text-stone-700">
            {index + 1}. {step.titleEn || step.title || prettyId(step.id || `step-${index + 1}`)}
          </li>
        ))}
      </ol>
    </article>
  );
}

function mediaByNoteMap(media: NoteMedia[]) {
  const mediaByNote = new Map<string, NoteMedia[]>();
  for (const item of media) {
    mediaByNote.set(item.note_id, [...(mediaByNote.get(item.note_id) || []), item]);
  }
  return mediaByNote;
}

async function hydrateMedia(mediaData: unknown) {
  return Promise.all(((mediaData || []) as NoteMedia[]).map(async (item) => ({
    ...item,
    displayUrl: item.media_type === "image" ? await signedStorageUrl(item.bucket, item.storage_path) : null,
  })));
}

async function renderNotes(notesData: unknown, mediaByNote: Map<string, NoteMedia[]>) {
  return Promise.all(((notesData || []) as DiaryNote[]).map(async (note) => {
    const blocks = Array.isArray(note.rich_content) ? note.rich_content : [];
    const renderedBlocks = await Promise.all(blocks.map(async (block) => {
      if (block.type !== "image") return block;
      const firstMedia = (mediaByNote.get(note.id) || []).find((item) => item.media_type === "image");
      const signedUrl = block.imageStoragePath
        ? await signedStorageUrl(block.mediaBucket || "note_media", block.imageStoragePath)
        : firstMedia?.displayUrl;
      return { ...block, imageUri: signedUrl || block.imageUri };
    }));
    return { ...note, renderedBlocks };
  }));
}

async function getPrivateNotes(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const [notesResult, mediaResult] = await Promise.all([
    supabaseAdmin
      .from("private_diary_notes")
      .select("id,date_key,title,text_content,rich_content,color,created_at_ms,created_at,updated_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    supabaseAdmin
      .from("private_diary_note_media")
      .select("id,note_id,media_type,bucket,storage_path,file_name,mime_type,file_size,duration_millis,created_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  if (notesResult.error || mediaResult.error) {
    const message = notesResult.error?.message || mediaResult.error?.message || "Could not load private diary notes.";
    return { available: false, error: message, notes: [] as DiaryNote[], media: [] as NoteMedia[] };
  }

  const media = await hydrateMedia(mediaResult.data);
  return {
    available: true,
    error: null,
    notes: await renderNotes(notesResult.data, mediaByNoteMap(media)),
    media,
  };
}

async function getUserDetail(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const [profileResult, notesResult, entriesResult, routinesResult, mediaResult] = await Promise.all([
    supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabaseAdmin
      .from("diary_notes")
      .select("id,date_key,title,text_content,rich_content,color,created_at_ms,created_at,updated_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    supabaseAdmin
      .from("diary_entries")
      .select("id,mood,mood_emoji,note,card_color,created_at,updated_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    supabaseAdmin
      .from("custom_routines")
      .select("id,title,title_en,subtitle,subtitle_en,icon,color,steps,created_at,updated_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false }),
    supabaseAdmin
      .from("diary_note_media")
      .select("id,note_id,media_type,bucket,storage_path,file_name,mime_type,file_size,duration_millis,created_at")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  if (profileResult.error) throw new Error(profileResult.error.message);
  if (notesResult.error) throw new Error(notesResult.error.message);
  if (entriesResult.error) throw new Error(entriesResult.error.message);
  if (routinesResult.error) throw new Error(routinesResult.error.message);
  if (mediaResult.error) throw new Error(mediaResult.error.message);
  if (!profileResult.data) throw new Error("User profile was not found.");

  const profile = profileResult.data as ProfileDetail;
  const media = await hydrateMedia(mediaResult.data);
  const notes = await renderNotes(notesResult.data, mediaByNoteMap(media));
  const privateNotes = await getPrivateNotes(userId);

  return {
    profile: {
      ...profile,
      avatarDisplayUrl: await signedStorageUrl("avatars", profile.avatar_url),
      visionBoardDisplayUrl: await signedStorageUrl("vision_board", profile.vision_board_image_url),
    },
    notes,
    privateNotes,
    entries: (entriesResult.data || []) as DiaryEntry[],
    routines: (routinesResult.data || []) as CustomRoutine[],
    media,
  };
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getUserDetail(id).then(
    (data) => ({ data, error: null }),
    (error: unknown) => ({ data: null, error }),
  );

  if (result.error || !result.data) {
    return (
      <AdminShell title="User Detail">
        <AdminError error={result.error} />
      </AdminShell>
    );
  }

  const { profile, notes, privateNotes, entries, routines, media } = result.data;
  const mediaByNote = mediaByNoteMap(media);
  const notesWithMedia = notes.map((note) => ({ ...note, media: mediaByNote.get(note.id) || [] }));
  const privateMediaByNote = mediaByNoteMap(privateNotes.media);
  const privateNotesWithMedia = privateNotes.notes.map((note) => ({ ...note, media: privateMediaByNote.get(note.id) || [] }));

  return (
    <AdminShell title={profile.name ? `User: ${profile.name}` : "User Detail"}>
      <Link href="/users" className="text-sm font-semibold text-pink-700 hover:text-pink-800">Back to users</Link>

      <section className="mt-4 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {profile.avatarDisplayUrl ? (
              <img src={profile.avatarDisplayUrl} alt="Profile photo" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-2xl font-bold text-pink-700">
                {(profile.name || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-pink-600">Profile</p>
              <h2 className="mt-1 text-2xl font-bold text-stone-950">{profile.name || "Unnamed user"}</h2>
              <p className="mt-2 font-mono text-xs text-stone-500">{profile.id}</p>
            </div>
          </div>
          <div className="text-sm text-stone-600">
            <p>Created: {formatDate(profile.created_at)}</p>
            <p>Updated: {formatDate(profile.updated_at)}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Day streak" value={profile.streak ?? 0} />
        <StatCard label="Last streak date" value={profile.last_streak_date} />
        <StatCard label="Total routines completed" value={profile.total_routines_completed ?? 0} />
        <StatCard label="Favorite routine" value={profile.favorite_routine_id ? routineLabels[profile.favorite_routine_id]?.title || prettyId(profile.favorite_routine_id) : "-"} />
      </section>

      <section className="mt-6">
        <ProgressSection profile={profile} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <ImagePreview title="Vision Board" url={profile.visionBoardDisplayUrl} subtitle={profile.vision_board_mode ? `Mode: ${profile.vision_board_mode}` : null} />
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-stone-950">Saved Reads</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(profile.favorite_advice || []).map((item) => (
              <span key={item} className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-800">{prettyId(item)}</span>
            ))}
            {(profile.favorite_advice || []).length === 0 ? <p className="text-sm text-stone-500">No saved reads.</p> : null}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-stone-950">Custom Routines ({routines.length})</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {routines.map((routine) => <CustomRoutineCard key={routine.id} routine={routine} />)}
          {routines.length === 0 ? <p className="text-sm text-stone-500">No custom routines.</p> : null}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-stone-950">Diary Entries ({entries.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-pink-100 text-sm">
            <thead className="bg-pink-50 text-left text-xs uppercase tracking-wide text-pink-700">
              <tr>{["date", "mood", "emoji", "note", "updated"].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {entries.map((entry) => (
                <tr key={entry.id} className="align-top">
                  <td className="px-4 py-3 font-mono text-xs">{entry.id}</td>
                  <td className="px-4 py-3 capitalize">{entry.mood || "-"}</td>
                  <td className="px-4 py-3">{entry.mood_emoji || "-"}</td>
                  <td className="max-w-xl px-4 py-3 leading-6">{entry.note || "-"}</td>
                  <td className="px-4 py-3">{formatDate(entry.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-stone-950">Diary Notes ({notes.length})</h2>
        <NotePreviewGrid notes={notesWithMedia} />
      </section>

      <section className="mt-6 rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-950">Private Diary Notes ({privateNotes.available ? privateNotes.notes.length : 0})</h2>
            <p className="mt-1 text-sm text-stone-500">PIN-gated notes from private_diary_notes. This section will not block the user page if the private tables are not installed yet.</p>
          </div>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Secret table</span>
        </div>
        {privateNotes.available ? (
          <NotePreviewGrid notes={privateNotesWithMedia} emptyText="No private diary notes." />
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Private diary tables are not available yet. Run <span className="font-mono">supabase_private_diary.sql</span> in Supabase, then refresh this page.
          </div>
        )}
      </section>
    </AdminShell>
  );
}
