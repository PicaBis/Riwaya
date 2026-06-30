"use client";

import { useEffect } from "react";

/**
 * Mounts invisible security hooks:
 * – Blocks right-click context menu
 * – Blocks Print / Save / View-Source keyboard shortcuts
 * – Flashes an opaque overlay on PrintScreen / window-blur (screen-capture apps)
 * – Injects a CSS @media print blackout
 */
export function AntiScreenshot() {
  useEffect(() => {
    /* ── Inject print blackout style ──────────────────── */
    const style = document.createElement("style");
    style.id = "__as_style";
    style.textContent = `
      @media print {
        html, body, * { display: none !important; visibility: hidden !important; }
        body::before {
          display: block !important;
          visibility: visible !important;
          content: "هذا المحتوى محمي بحقوق الطبع والنشر — روايتي";
          font-size: 24px;
          text-align: center;
          padding-top: 40vh;
          color: #111;
        }
      }
    `;
    document.head.appendChild(style);

    /* ── Overlay element (shown during capture attempts) ── */
    const overlay = document.createElement("div");
    overlay.id = "__as_overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99999",
      background: "#0F0E0C",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: "16px",
    });
    overlay.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8860B" stroke-width="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <p style="color:#B8860B;font-family:serif;font-size:18px;margin:0;direction:rtl;">المحتوى محمي</p>
    `;
    document.body.appendChild(overlay);

    const showOverlay = () => {
      overlay.style.display = "flex";
      setTimeout(() => { overlay.style.display = "none"; }, 600);
    };

    /* ── Context menu ──────────────────────────────────── */
    const onCtxMenu = (e: MouseEvent) => e.preventDefault();

    /* ── Keyboard ──────────────────────────────────────── */
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();

      // PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        showOverlay();
        // Poison the clipboard
        navigator.clipboard?.writeText("").catch(() => {});
        return;
      }
      // Ctrl/Cmd combos
      if (e.ctrlKey || e.metaKey) {
        if (["p", "s", "u", "a"].includes(k)) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey && ["i", "j", "c"].includes(k)) {
          e.preventDefault();
          return;
        }
      }
      // F12, F5 with shift
      if (e.key === "F12") { e.preventDefault(); return; }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") showOverlay();
    };

    /* ── Visibility / focus (catches external screenshot tools) ── */
    const onVisibility = () => {
      if (document.visibilityState === "hidden") showOverlay();
    };

    document.addEventListener("contextmenu", onCtxMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("contextmenu", onCtxMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibility);
      document.getElementById("__as_style")?.remove();
      document.getElementById("__as_overlay")?.remove();
    };
  }, []);

  return null;
}
