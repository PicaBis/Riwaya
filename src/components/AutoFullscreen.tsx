"use client";

/* AutoFullscreen prompt intentionally disabled by user request — it was
   causing a full-screen black overlay at page load. Returning null keeps the
   import in layout.tsx valid without rendering anything. */
export function AutoFullscreen() {
  return null;
}