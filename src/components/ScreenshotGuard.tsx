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

export default function ScreenshotGuard() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const blurIntervalRef = useRef<number | null>(null);
  const hiddenIntervalRef = useRef<number | null>(null);
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

  /* ── 1. PrintScreen / Shift+S ──────────────────── */
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
        applyBodyBlur(true);
        setTimeout(() => applyBodyBlur(false), 3000);
        overwriteClipboard();
        let remaining = 5;
        const id = window.setInterval(() => {
          overwriteClipboard();
          remaining -= 1;
          if (remaining <= 0 && id) {
            window.clearInterval(id);
          }
        }, 200);
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [typingTarget, showOverlay, applyBodyBlur]);

  /* ── 2. Window blur — Snipping Tool / tab switch loses focus ── */
  useEffect(() => {
    const startBlurProtection = () => {
      showOverlay(4000);
      applyBodyBlur(true);
      overwriteClipboard();
      blurIntervalRef.current = window.setInterval(() => {
        overwriteClipboard();
      }, 300);
    };

    const stopBlurProtection = () => {
      applyBodyBlur(false);
      if (blurIntervalRef.current) {
        window.clearInterval(blurIntervalRef.current);
        blurIntervalRef.current = null;
      }
      overwriteClipboard();
    };

    window.addEventListener("blur", startBlurProtection);
    window.addEventListener("focus", stopBlurProtection);

    return () => {
      window.removeEventListener("blur", startBlurProtection);
      window.removeEventListener("focus", stopBlurProtection);
      if (blurIntervalRef.current) {
        window.clearInterval(blurIntervalRef.current);
        blurIntervalRef.current = null;
      }
    };
  }, [showOverlay, applyBodyBlur]);

  /* ── 3. Visibility change — page hidden / visible ── */
  useEffect(() => {
    const onChange = () => {
      if (document.hidden) {
        applyBodyBlur(true);
        overwriteClipboard();
        hiddenIntervalRef.current = window.setInterval(() => {
          overwriteClipboard();
        }, 300);
      } else {
        applyBodyBlur(false);
        if (hiddenIntervalRef.current) {
          window.clearInterval(hiddenIntervalRef.current);
          hiddenIntervalRef.current = null;
        }
        overwriteClipboard();
        let remaining = 4;
        const id = window.setInterval(() => {
          overwriteClipboard();
          remaining -= 1;
          if (remaining <= 0 && id) {
            window.clearInterval(id);
          }
        }, 400);
      }
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, [applyBodyBlur]);

  /* ── 4. Mouse leave window — trigger protection ── */
  useEffect(() => {
    const onLeave = () => {
      showOverlay(3000);
      applyBodyBlur(true);
      overwriteClipboard();
      let remaining = 4;
      const id = window.setInterval(() => {
        overwriteClipboard();
        remaining -= 1;
        if (remaining <= 0 && id) {
          window.clearInterval(id);
        }
      }, 400);
    };
    const onEnter = () => {
      applyBodyBlur(false);
    };
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    return () => {
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [showOverlay, applyBodyBlur]);

  /* ── 6. Block copy (site-wide, outside inputs) ───── */
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
