/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { ImageLightboxButton } from "@/components/ImageLightboxButton";

type RichBlock = {
  id?: string;
  text?: string;
  type?: string;
  imageUri?: string;
};

type NoteMedia = {
  id: string;
  media_type: string;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  duration_millis: number | null;
};

export type NotePreview = {
  id: string;
  date_key: string;
  title: string | null;
  text_content: string | null;
  updated_at: string | null;
  renderedBlocks?: RichBlock[];
  media?: NoteMedia[];
};

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

function isLocalOrEmptyImage(uri: string | undefined) {
  return !uri || uri.startsWith("file://") || uri.startsWith("content://");
}

function noteText(note: NotePreview) {
  const blockText = (note.renderedBlocks || [])
    .map((block) => block.text?.trim())
    .filter(Boolean)
    .join("\n\n");
  return blockText || note.text_content?.trim() || "";
}

function noteImages(note: NotePreview) {
  return (note.renderedBlocks || [])
    .filter((block) => block.type === "image" && block.imageUri && !isLocalOrEmptyImage(block.imageUri))
    .map((block) => block.imageUri as string);
}

function TextBlock({ block }: { block: RichBlock }) {
  if (!block.text?.trim()) return null;
  const size = block.type === "h1" ? "text-2xl font-bold" : block.type === "h2" ? "text-xl font-bold" : "text-sm";
  return <p className={`${size} whitespace-pre-wrap leading-6 text-stone-800`}>{block.text}</p>;
}

function FullNote({ note }: { note: NotePreview }) {
  const blocks = note.renderedBlocks || [];
  const otherMedia = (note.media || []).filter((item) => item.media_type !== "image");

  return (
    <div className="grid gap-4">
      {blocks.map((block, index) => {
        if (block.type === "image" && block.imageUri && !isLocalOrEmptyImage(block.imageUri)) {
          return (
            <ImageLightboxButton
              key={block.id || index}
              src={block.imageUri}
              alt={block.text || "Note image"}
              className="max-h-[60vh] w-full rounded-xl bg-pink-50 object-contain"
            />
          );
        }
        return <TextBlock key={block.id || index} block={block} />;
      })}

      {blocks.length === 0 && note.text_content ? (
        <p className="whitespace-pre-wrap rounded-xl bg-stone-50 p-4 text-sm leading-6 text-stone-700">{note.text_content}</p>
      ) : null}

      {otherMedia.length > 0 ? (
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-stone-700">Audio / Other Media</p>
          {otherMedia.map((item) => (
            <div key={item.id} className="rounded-lg border border-pink-100 bg-pink-50 p-3 text-xs text-stone-700">
              <p>
                <strong>{item.media_type}</strong> {item.mime_type || ""}
              </p>
              <p>
                File: {item.file_name || "-"} / Size: {item.file_size ?? "-"} / Duration: {item.duration_millis ?? "-"}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function NotePreviewGrid({ emptyText = "No diary notes.", notes }: { emptyText?: string; notes: NotePreview[] }) {
  const [selectedNote, setSelectedNote] = useState<NotePreview | null>(null);
  const decoratedNotes = useMemo(
    () => notes.map((note) => ({ note, text: noteText(note), images: noteImages(note) })),
    [notes],
  );

  if (notes.length === 0) {
    return <p className="mt-4 text-sm text-stone-500">{emptyText}</p>;
  }

  return (
    <>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {decoratedNotes.map(({ note, text, images }) => (
          <button
            key={note.id}
            type="button"
            className="min-h-64 rounded-2xl border border-pink-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md"
            onClick={() => setSelectedNote(note)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-950">{note.title || "Untitled note"}</p>
                <p className="mt-1 font-mono text-xs text-stone-500">{note.date_key}</p>
              </div>
              <span className="shrink-0 rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">Open</span>
            </div>

            {images[0] ? <img src={images[0]} alt="" className="mt-4 h-32 w-full rounded-xl bg-pink-50 object-cover" /> : null}

            <p className="mt-4 overflow-hidden text-sm leading-6 text-stone-700 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
              {text || "No written note text saved."}
            </p>
            <p className="mt-4 text-xs text-stone-500">Updated: {formatDate(note.updated_at)}</p>
          </button>
        ))}
      </div>

      {selectedNote ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedNote(null)}
        >
          <article
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-3 border-b border-pink-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-stone-950">{selectedNote.title || "Untitled note"}</h3>
                <p className="mt-1 font-mono text-xs text-stone-500">{selectedNote.id} / {selectedNote.date_key}</p>
                <p className="mt-2 text-sm text-stone-500">Updated: {formatDate(selectedNote.updated_at)}</p>
              </div>
              <button
                type="button"
                className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-800 hover:bg-pink-200"
                onClick={() => setSelectedNote(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-5">
              <FullNote note={selectedNote} />
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}
