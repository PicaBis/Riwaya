"use client";

import { useEffect, useRef, useCallback } from "react";

function createWhiteImageBlob(): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 1920, 1080);
      canvas.toBlob((blob) => resolve(blob!), "image/png");
    } else {
      resolve(new Blob([], { type: "image/png" }));
    }
  });
}

async function overwriteClipboard(): Promise<void> {
  try {
    const blob = await createWhiteImageBlob();
    const item = new ClipboardItem({ "image/png": blob });
    await navigator.clipboard.write([item]);
  } catch {
    /* clipboard may be unavailable */
  }
}

function scheduleWrites(
  count: number,
  interval: number,
  cancelRef: { current: boolean },
  delay?: number
): void {
  const ref = cancelRef;
  const schedule = (remaining: number) => {
    if (ref.current || remaining <= 0) return;
    overwriteClipboard();
    if (remaining > 1) {
      setTimeout(() => schedule(remaining - 1), interval);
    }
  };
  if (delay) {
    setTimeout(() => schedule(count), delay);
  } else {
    schedule(count);
  }
}

export default function ScreenshotGuard() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const blurCancelRef = useRef(false);
  const focusCancelRef = useRef(false);
  const visibleCancelRef = useRef(false);
  const mouseCancelRef = useRef(false);
  const typingTarget = useCallback(
    (t: EventTarget | null): boolean => {
      const el = t as HTMLElement | null;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    },
    []
  );

  /* ── Overlay helpers ─────────────────────────────── */
  const showOverlay = useCallback((durationMs: number) => {
    const el = overlayRef.current;
    if (!el) return;
    el.classList.add("guard-visible");
    setTimeout(() => el.classList.remove("guard-visible"), durationMs);
  }, []);

  const applyBodyBlur = useCallback((enable: boolean) => {
    const body = document.body;
    if (enable) {
      body.classList.add("guard-blur");
    } else {
      body.classList.remove("guard-blur");
    }
  }, []);

  /* ── 1. PrintScreen ──────────────────────────────── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (typingTarget(e.target)) return;
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && ["c", "s", "p", "a"].includes(key)) {
        e.preventDefault();
      }
      if (key === "printscreen" || (e.shiftKey && key === "s")) {
        e.preventDefault();
        showOverlay(3000);
        blurCancelRef.current = false;
        scheduleWrites(5, 200, blurCancelRef);
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [typingTarget, showOverlay]);

  /* ── 2. Window blur → Snipping Tool ──────────────────
   * IMPORTANT: window blur fires for perfectly harmless reasons — a browser
   * clipboard/permission popup, switching tabs, opening devtools. Previously
   * this flashed a full-screen black overlay + blurred the page, so any popup
   * would black out the whole site. We now keep the SILENT clipboard defense
   * on blur (still defeats snip-and-copy) but never darken the page here. */
  useEffect(() => {
    const onBlur = () => {
      // Make sure no leftover overlay/blur remains from a screenshot key press.
      applyBodyBlur(false);
      blurCancelRef.current = false;
      scheduleWrites(8, 300, blurCancelRef);
    };
    const onFocus = () => {
      blurCancelRef.current = true;
      applyBodyBlur(false);
      focusCancelRef.current = false;
      scheduleWrites(4, 500, focusCancelRef, 1000);
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [applyBodyBlur]);

  /* ── 3. Visibility change ────────────────────────── */
  useEffect(() => {
    const onChange = () => {
      if (document.hidden) {
        visibleCancelRef.current = false;
        scheduleWrites(6, 300, visibleCancelRef);
      } else {
        visibleCancelRef.current = true;
        const ref = { current: false };
        scheduleWrites(4, 400, ref, 1200);
      }
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  /* ── 4. Mouse leave window ───────────────────────── */
  useEffect(() => {
    const onLeave = () => {
      mouseCancelRef.current = false;
      scheduleWrites(4, 400, mouseCancelRef);
    };
    const onEnter = () => {
      mouseCancelRef.current = true;
    };
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    return () => {
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  /* ── 5. Block copy (site-wide, outside inputs) ───── */
  useEffect(() => {
    const onCopy = (e: ClipboardEvent) => {
      if (!typingTarget(e.target)) {
        e.preventDefault();
        overwriteClipboard();
      }
    };
    const onCut = (e: ClipboardEvent) => {
      if (!typingTarget(e.target)) e.preventDefault();
    };
    const onPaste = (e: ClipboardEvent) => {
      if (!typingTarget(e.target)) {
        e.preventDefault();
        overwriteClipboard();
      }
    };
    const onDrag = (e: DragEvent) => {
      if (!typingTarget(e.target)) e.preventDefault();
    };
    const onContext = (e: MouseEvent) => {
      if (!typingTarget(e.target)) e.preventDefault();
    };

    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("contextmenu", onContext);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("contextmenu", onContext);
    };
  }, [typingTarget]);

  return (
    <>
      {/* ── Black overlay that flashes during screenshot attempts ── */}
      <div
        ref={overlayRef}
        id="screenshot-guard-overlay"
        className="
          fixed inset-0 z-[999999] flex items-center justify-center
          bg-black pointer-events-none select-none
          opacity-0 transition-opacity duration-300
        "
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {/* ── Floating watermarked identity ── */}
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
    </>
  );
}
