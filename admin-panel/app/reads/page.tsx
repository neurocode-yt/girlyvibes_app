import { readFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { AdminError } from "@/components/AdminError";
import { AdminShell } from "@/components/AdminShell";
import { SubmitButton } from "@/components/SubmitButton";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type ReadCard = {
  id: string;
  title: string;
  titleEn: string;
  preview: string;
  previewEn: string;
  content: string;
  contentEn: string;
  category: string;
  readTime: string;
  readTimeEn: string;
  isActive?: boolean;
  sortOrder?: number;
};

type ReadCategory = {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  color: string;
  isActive?: boolean;
  sortOrder?: number;
  cards: ReadCard[];
};

type AdviceContent = {
  categories: ReadCategory[];
};

function emptyAdviceContent(): AdviceContent {
  return { categories: [] };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asAdviceContent(value: unknown): AdviceContent {
  const record = asRecord(value);
  const rawCategories = Array.isArray(record.categories) ? record.categories : [];
  return {
    categories: rawCategories.map((categoryValue): ReadCategory => {
      const category = asRecord(categoryValue);
      const cards = Array.isArray(category.cards) ? category.cards : [];
      return {
        id: String(category.id || ""),
        title: String(category.title || ""),
        titleEn: String(category.titleEn || ""),
        icon: String(category.icon || "notebook-outline"),
        color: String(category.color || "#F7C9D9"),
        isActive: category.isActive === false ? false : true,
        sortOrder: Number(category.sortOrder || 0),
        cards: cards.map((cardValue): ReadCard => {
          const card = asRecord(cardValue);
          return {
            id: String(card.id || ""),
            title: String(card.title || ""),
            titleEn: String(card.titleEn || ""),
            preview: String(card.preview || ""),
            previewEn: String(card.previewEn || ""),
            content: String(card.content || ""),
            contentEn: String(card.contentEn || ""),
            category: String(card.category || category.id || ""),
            readTime: String(card.readTime || ""),
            readTimeEn: String(card.readTimeEn || ""),
            isActive: card.isActive === false ? false : true,
            sortOrder: Number(card.sortOrder || 0),
          };
        }),
      };
    }).filter((category) => category.id),
  };
}

function normalizeId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function nextIncrementalId(prefix: string, ids: string[]) {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matcher = new RegExp(`^${escapedPrefix}-?(\\d+)$`);
  const next = ids.reduce((max, id) => {
    const match = id.match(matcher);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;
  return `${prefix}${prefix.endsWith("-") ? "" : "-"}${next}`;
}

function nextReadId(content: AdviceContent) {
  return nextIncrementalId("read", content.categories.flatMap((category) => category.cards.map((card) => card.id)));
}

function nextCategoryId(content: AdviceContent) {
  return nextIncrementalId("category", content.categories.map((category) => category.id));
}

function arabicDigits(value: number) {
  return String(value).replace(/\d/g, (digit) => "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669"[Number(digit)]);
}

function readTimeFromMinutes(rawValue: FormDataEntryValue | null) {
  const minutes = Number(String(rawValue || "").trim());
  if (!Number.isFinite(minutes) || minutes <= 0) return { readTime: "", readTimeEn: "" };
  const rounded = Math.round(minutes);
  return {
    readTime: `${arabicDigits(rounded)} ${rounded === 1 ? "\u062f\u0642\u064a\u0642\u0629" : "\u062f\u0642\u0627\u0626\u0642"}`,
    readTimeEn: `${rounded} ${rounded === 1 ? "minute" : "minutes"}`,
  };
}

function readMinutes(card: ReadCard) {
  const match = `${card.readTimeEn} ${card.readTime}`.match(/\d+/);
  return match ? Number(match[0]) : "";
}

function mergeAdviceContent(base: AdviceContent, incoming: AdviceContent) {
  const categories = [...base.categories];
  for (const incomingCategory of incoming.categories) {
    const existingIndex = categories.findIndex((category) => category.id === incomingCategory.id);
    if (existingIndex === -1) {
      categories.push(incomingCategory);
      continue;
    }

    const existing = categories[existingIndex];
    const existingCardIds = new Set(existing.cards.map((card) => card.id));
    categories[existingIndex] = {
      ...incomingCategory,
      ...existing,
      cards: [
        ...existing.cards,
        ...incomingCategory.cards.filter((card) => !existingCardIds.has(card.id)),
      ],
    };
  }
  return { categories };
}

async function loadAdviceContent() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "advice_content")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.value ? asAdviceContent(data.value) : emptyAdviceContent();
}

async function loadStaticAdviceContent() {
  const advicePath = path.join(process.cwd(), "..", "artifacts", "girlyvibes", "data", "advice.ts");
  const source = await readFile(advicePath, "utf8");
  const exportStart = source.indexOf("export const ADVICE_CATEGORIES");
  const arrayStart = source.indexOf("[", exportStart);
  const arrayEnd = source.lastIndexOf("];");
  if (exportStart === -1 || arrayStart === -1 || arrayEnd === -1) {
    throw new Error("Could not read bundled static advice data.");
  }

  const arrayLiteral = source.slice(arrayStart, arrayEnd + 1);
  const categories = Function(`"use strict"; return (${arrayLiteral});`)() as ReadCategory[];
  return {
    categories: categories.map((category, categoryIndex) => ({
      ...category,
      isActive: true,
      sortOrder: categoryIndex + 1,
      cards: category.cards.map((card, cardIndex) => ({
        ...card,
        isActive: true,
        sortOrder: cardIndex + 1,
      })),
    })),
  };
}

async function saveAdviceContent(content: AdviceContent) {
  const supabaseAdmin = getSupabaseAdmin();
  const sortedContent = {
    categories: content.categories
      .map((category) => ({
        ...category,
        cards: [...category.cards].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
      }))
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
  };
  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: "advice_content", value: sortedContent }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/reads");
}

async function uploadStaticReads() {
  "use server";
  const [content, staticContent] = await Promise.all([loadAdviceContent(), loadStaticAdviceContent()]);
  await saveAdviceContent(mergeAdviceContent(content, staticContent));
}

async function upsertCategory(formData: FormData) {
  "use server";
  const content = await loadAdviceContent();
  const rawId = normalizeId(String(formData.get("id") || ""));
  const id = rawId || nextCategoryId(content);

  const nextCategory: ReadCategory = {
    id,
    title: String(formData.get("title") || "").trim(),
    titleEn: String(formData.get("titleEn") || "").trim(),
    icon: String(formData.get("icon") || "notebook-outline").trim(),
    color: String(formData.get("color") || "#F7C9D9").trim(),
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(formData.get("sortOrder") || 0),
    cards: content.categories.find((category) => category.id === id)?.cards || [],
  };

  if (!nextCategory.title || !nextCategory.titleEn) throw new Error("Category title and English title are required.");
  content.categories = [...content.categories.filter((category) => category.id !== id), nextCategory];
  await saveAdviceContent(content);
}

async function deleteCategory(formData: FormData) {
  "use server";
  const content = await loadAdviceContent();
  const id = String(formData.get("id") || "");
  content.categories = content.categories.filter((category) => category.id !== id);
  await saveAdviceContent(content);
}

async function upsertRead(formData: FormData) {
  "use server";
  const [content, staticContent] = await Promise.all([loadAdviceContent(), loadStaticAdviceContent()]);
  const categoryId = String(formData.get("category") || "").trim();
  let category = content.categories.find((item) => item.id === categoryId);
  const staticCategory = staticContent.categories.find((item) => item.id === categoryId);
  if (!category && staticCategory) {
    category = { ...staticCategory, cards: [] };
    content.categories.push(category);
  }
  if (!category) throw new Error("Select or create a category first.");

  const rawId = normalizeId(String(formData.get("id") || ""));
  const id = rawId || nextReadId(content);
  const { readTime, readTimeEn } = readTimeFromMinutes(formData.get("readMinutes"));

  const nextRead: ReadCard = {
    id,
    title: String(formData.get("title") || "").trim(),
    titleEn: String(formData.get("titleEn") || "").trim(),
    preview: String(formData.get("preview") || "").trim(),
    previewEn: String(formData.get("previewEn") || "").trim(),
    content: String(formData.get("content") || "").trim(),
    contentEn: String(formData.get("contentEn") || "").trim(),
    category: categoryId,
    readTime,
    readTimeEn,
    isActive: formData.get("isActive") === "on",
    sortOrder: Number(formData.get("sortOrder") || 0),
  };

  if (!nextRead.title || !nextRead.titleEn || !nextRead.content || !nextRead.contentEn) {
    throw new Error("Read title and content fields are required.");
  }

  category.cards = [...category.cards.filter((card) => card.id !== id), nextRead];
  await saveAdviceContent(content);
}

async function deleteRead(formData: FormData) {
  "use server";
  const content = await loadAdviceContent();
  const categoryId = String(formData.get("category") || "");
  const id = String(formData.get("id") || "");
  content.categories = content.categories.map((category) => (
    category.id === categoryId
      ? { ...category, cards: category.cards.filter((card) => card.id !== id) }
      : category
  ));
  await saveAdviceContent(content);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-stone-700">
      {label}
      {children}
    </label>
  );
}

const inputClass = "rounded-lg border border-pink-100 px-3 py-2 font-normal text-stone-900 outline-none focus:ring-2 focus:ring-pink-400";
const textareaClass = `${inputClass} min-h-28`;

export default async function ReadsPage() {
  const result = await Promise.all([loadAdviceContent(), loadStaticAdviceContent()]).then(
    ([content, staticContent]) => ({ content, staticContent, error: null }),
    (error: unknown) => ({ content: emptyAdviceContent(), staticContent: emptyAdviceContent(), error }),
  );

  if (result.error) {
    return (
      <AdminShell title="Reads">
        <AdminError error={result.error} />
      </AdminShell>
    );
  }

  const content = result.content;
  const staticContent = result.staticContent;
  const allContent = mergeAdviceContent(staticContent, content);
  const readCount = content.categories.reduce((total, category) => total + category.cards.length, 0);
  const staticReadCount = staticContent.categories.reduce((total, category) => total + category.cards.length, 0);

  return (
    <AdminShell title="Reads">
      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">DB categories</p>
          <p className="mt-2 text-3xl font-bold text-pink-700">{content.categories.length}</p>
        </div>
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">DB reads</p>
          <p className="mt-2 text-3xl font-bold text-pink-700">{readCount}</p>
        </div>
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Static reads</p>
          <p className="mt-2 text-3xl font-bold text-pink-700">{staticReadCount}</p>
        </div>
        <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-stone-500">Mobile source</p>
          <p className="mt-2 text-sm font-semibold text-stone-800">Static reads plus DB overrides</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-950">Bundled static reads</h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              These are the offline reads shipped inside the mobile app. Upload them to the database when you want every bundled read editable from this admin panel.
            </p>
          </div>
          <form action={uploadStaticReads}>
            <SubmitButton>Upload static reads to database</SubmitButton>
          </form>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {staticContent.categories.map((category) => (
            <span key={category.id} className="rounded-full bg-pink-50 px-3 py-1 text-sm font-semibold text-pink-700">
              {category.titleEn} ({category.cards.length})
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <form action={upsertCategory} className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-stone-950">Create or update category</h2>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <input name="title" placeholder="الثقة بالنفس" required className={inputClass} />
              </Field>
              <Field label="Title English">
                <input name="titleEn" placeholder="Confidence" required className={inputClass} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Icon">
                <input name="icon" placeholder="heart-outline" className={inputClass} />
              </Field>
              <Field label="Color">
                <input name="color" placeholder="#F7C9D9" className={inputClass} />
              </Field>
              <Field label="Sort order">
                <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4 accent-pink-600" />
              Active
            </label>
            <SubmitButton>Save category</SubmitButton>
          </div>
        </form>

        <form action={upsertRead} className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-stone-950">Create or update read</h2>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Read ID (optional)">
                <input name="id" placeholder="Auto: read-1" className={inputClass} />
              </Field>
              <Field label="Category">
                <select name="category" required className={inputClass}>
                  <option value="">Select</option>
                  {allContent.categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.titleEn || category.title}</option>
                  ))}
                </select>
              </Field>
              <Field label="Sort order">
                <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <input name="title" required className={inputClass} />
              </Field>
              <Field label="Title English">
                <input name="titleEn" required className={inputClass} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Preview">
                <textarea name="preview" className={textareaClass} />
              </Field>
              <Field label="Preview English">
                <textarea name="previewEn" className={textareaClass} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Read time minutes">
                <input name="readMinutes" type="number" min={1} placeholder="3" className={inputClass} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Content">
                <textarea name="content" required rows={10} className={textareaClass} />
              </Field>
              <Field label="Content English">
                <textarea name="contentEn" required rows={10} className={textareaClass} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4 accent-pink-600" />
              Active
            </label>
            <SubmitButton>Save read</SubmitButton>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-4">
        {content.categories.map((category) => (
          <div key={category.id} className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="h-4 w-4 rounded-full border border-pink-100" style={{ backgroundColor: category.color }} />
                  <h2 className="text-lg font-bold text-stone-950">{category.titleEn}</h2>
                  <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">{category.id}</span>
                  {!category.isActive ? <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">Hidden</span> : null}
                </div>
                <p className="mt-1 text-sm text-stone-500">{category.title} / Icon: {category.icon} / Sort: {category.sortOrder ?? 0}</p>
              </div>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={category.id} />
                <button type="submit" className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
                  Delete category
                </button>
              </form>
            </div>

            <div className="mt-4 grid gap-4">
              {category.cards.length === 0 ? <p className="text-sm text-stone-500">No DB reads in this category yet.</p> : null}
              {category.cards.map((card) => (
                <form key={card.id} action={upsertRead} className="rounded-xl border border-pink-100 bg-pink-50/40 p-4">
                  <input type="hidden" name="id" value={card.id} />
                  <input type="hidden" name="category" value={category.id} />
                  <div className="grid gap-3 lg:grid-cols-[1fr_1fr_120px]">
                    <Field label="Title">
                      <input name="title" defaultValue={card.title} required className={inputClass} />
                    </Field>
                    <Field label="Title English">
                      <input name="titleEn" defaultValue={card.titleEn} required className={inputClass} />
                    </Field>
                    <Field label="Sort">
                      <input name="sortOrder" type="number" defaultValue={card.sortOrder ?? 0} className={inputClass} />
                    </Field>
                  </div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <Field label="Preview">
                      <textarea name="preview" defaultValue={card.preview} className={textareaClass} />
                    </Field>
                    <Field label="Preview English">
                      <textarea name="previewEn" defaultValue={card.previewEn} className={textareaClass} />
                    </Field>
                    <Field label="Content">
                      <textarea name="content" defaultValue={card.content} required rows={8} className={textareaClass} />
                    </Field>
                    <Field label="Content English">
                      <textarea name="contentEn" defaultValue={card.contentEn} required rows={8} className={textareaClass} />
                    </Field>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Read time minutes">
                      <input name="readMinutes" type="number" min={1} defaultValue={readMinutes(card)} className={inputClass} />
                    </Field>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <input name="isActive" type="checkbox" defaultChecked={card.isActive !== false} className="h-4 w-4 accent-pink-600" />
                      Active
                    </label>
                    <SubmitButton>Update read</SubmitButton>
                    <button
                      formAction={deleteRead}
                      type="submit"
                      className="rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete read
                    </button>
                  </div>
                </form>
              ))}
            </div>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
