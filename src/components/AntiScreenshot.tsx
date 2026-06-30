"use client";

import { useEffect } from "react";

/**
 * Mounts invisible security hooks:
 * – Blocks right-click context menu
 * – Blocks Print / Save / View-Source keyboard shortcuts
 * – Flashes an opaque overlay on PrintScreen / window-blur (screen-capture apps)
 * – Injects a CSS @media print blackout
 * – Disables drag-and-drop
 * – Disables text selection on protected content
 * – Blocks copy event
 * – Adds blur effect on visibility change (anti-screenshot)
 */
export function AntiScreenshot() {
  useEffect(() => {
    /* ── Inject print blackout + anti-select styles ───── */
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

      /* Disable user-select on protected elements */
      .no-select {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }

      /* Disable drag on images and links */
      img, a, canvas {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto;
      }

      /* Blur overlay on visibility change */
      .__as_blur_overlay {
        position: fixed;
        inset: 0;
        z-index: 99998;
        background: rgba(15, 14, 12, 0.95);
        backdrop-filter: blur(20px);
        display: none;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        transition: opacity 0.3s ease;
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

    /* ── Blur overlay (shown on window blur / visibility change) ── */
    const blurOverlay = document.createElement("div");
    blurOverlay.id = "__as_blur";
    blurOverlay.className = "__as_blur_overlay";
    blurOverlay.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8860B" stroke-width="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <p style="color:#B8860B;font-family:serif;font-size:16px;margin:0;direction:rtl;">الرجاء العودة للقراءة</p>
    `;
    document.body.appendChild(blurOverlay);

    const showOverlay = () => {
      overlay.style.display = "flex";
      setTimeout(() => { overlay.style.display = "none"; }, 600);
    };

    const showBlur = () => {
      blurOverlay.style.display = "flex";
    };

    const hideBlur = () => {
      blurOverlay.style.display = "none";
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
        // Block copy, save, view-source, select-all, print
        if (["p", "s", "u", "a", "c", "x"].includes(k)) {
          e.preventDefault();
          return;
        }
        // Block dev tools shortcuts
        if (e.shiftKey && ["i", "j", "c", "s", "k"].includes(k)) {
          e.preventDefault();
          return;
        }
      }
      // F12, F5 with shift
      if (e.key === "F12" || e.key === "F5") { e.preventDefault(); return; }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") showOverlay();
    };

    /* ── Copy / Cut / Paste prevention ─────────────────── */
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    /* ── Drag and drop prevention ──────────────────────── */
    const onDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
    };
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    /* ── Visibility / focus (catches external screenshot tools) ── */
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        showBlur();
      } else {
        hideBlur();
      }
    };

    /* ── Window blur (catches alt-tab screenshot) ──────── */
    const onBlur = () => {
      showBlur();
    };
    const onFocus = () => {
      hideBlur();
    };

    /* ── Select all prevention ─────────────────────────── */
    const onSelectStart = (e: Event) => {
      // Allow selection in input/textarea elements
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener("contextmenu", onCtxMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("drop", onDrop);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("selectstart", onSelectStart);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      document.removeEventListener("contextmenu", onCtxMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("drop", onDrop);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("selectstart", onSelectStart);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.getElementById("__as_style")?.remove();
      document.getElementById("__as_overlay")?.remove();
      document.getElementById("__as_blur")?.remove();
    };
  }, []);

  return null;
}
