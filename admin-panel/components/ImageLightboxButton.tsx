/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";

type ImageLightboxButtonProps = {
  src: string;
  alt: string;
  className?: string;
  buttonClassName?: string;
};

export function ImageLightboxButton({ src, alt, className, buttonClassName }: ImageLightboxButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={buttonClassName || "block w-full text-left"}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <img src={src} alt={alt} className={className} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/75 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-800 hover:bg-pink-200"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <img src={src} alt={alt} className="mx-auto max-h-[78vh] w-auto max-w-full rounded-xl object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
