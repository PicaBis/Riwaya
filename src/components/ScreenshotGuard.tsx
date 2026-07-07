"use client";

import { useEffect, useCallback } from "react";

/**
 * Lightweight, SILENT content protection.
 *
 * The previous version flashed a full-screen black overlay and wrote a blank
 * image to the clipboard on every window `blur` / tab switch / devtools open.
 * That produced constant false positives — the site would go black and the
 * browser would pop up a "copied to clipboard" notification during normal use.
 *
 * This version keeps only quiet deterrents that never disrupt the page:
 *   - prevent copy / cut / paste / drag / context-menu outside inputs
 *   - prevent the common Ctrl/Cmd shortcuts and PrintScreen default
 * No overlays, no body blur, no clipboard writes — so it can never black out
 * the site or trigger a clipboard permission popup.
 */
export default function ScreenshotGuard() {
  const typingTarget = useCallback((t: EventTarget | null): boolean => {
    const el = t as HTMLElement | null;
    return (
      !!el &&
      (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
    );
  }, []);

  /* ── Silently block copy shortcuts (outside inputs) ── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (typingTarget(e.target)) return;
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && ["c", "s", "p", "a"].includes(key)) e.preventDefault();
      if (key === "printscreen" || (e.shiftKey && key === "s" && ctrl)) {
        // Prevent the default only; no overlay, no flash.
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [typingTarget]);

  /* ── Silently block copy / cut / paste / drag / context menu ── */
  useEffect(() => {
    const block = (e: Event) => {
      if (!typingTarget(e.target)) e.preventDefault();
    };
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("paste", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("contextmenu", block);
    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("contextmenu", block);
    };
  }, [typingTarget]);

  /* ── Faint identity watermark (non-intrusive) ── */
  return (
    <div
      className="pointer-events-none select-none fixed z-[9998] font-arabic font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap"
      style={{
        bottom: "8vh",
        right: "8vw",
        opacity: 0.035,
        fontSize: "clamp(10px, 2vw, 18px)",
      }}
      aria-hidden="true"
    >
      روايتي — rewayati.vercel.app
    </div>
  );
}
