"use client";

import { useEffect } from "react";

/**
 * Maximum content protection - blocks all screenshot methods:
 * - OS-level tools (Snipping Tool, ShareX, Greenshot) via window blur + mouseleave
 * - Browser PrintScreen key
 * - DevTools detection via size differential
 * - All keyboard shortcuts (save/print/devtools/view-source)
 * - Right-click, drag, drop, text selection
 * - Clipboard poisoning on all trigger events
 * - CSS user-select + @media print protection
 * - Long overlay duration to cover screenshot timing
 */
export function AntiScreenshot() {
  useEffect(() => {
    /* ── CSS injection ──────────────────────────────── */
    const style = document.createElement("style");
    style.id = "__as_style";
    style.textContent = `
      @media print {
        html, body, * { display: none !important; visibility: hidden !important; }
        body::before {
          display: block !important; visibility: visible !important;
          content: "هذا المحتوى محمي بحقوق الطبع والنشر — روايتي";
          font-size: 24px; text-align: center; padding-top: 40vh; color: #111;
        }
      }
      * { -webkit-user-select: none !important; user-select: none !important; }
      input, textarea { -webkit-user-select: text !important; user-select: text !important; }
    `;
    document.head.appendChild(style);

    /* ── Overlay element ────────────────────────────── */
    const overlay = document.createElement("div");
    overlay.id = "__as_overlay";
    Object.assign(overlay.style, {
      position: "fixed", inset: "0", zIndex: "999999",
      background: "#0F0E0C", display: "none",
      alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px",
    });
    overlay.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8860B" stroke-width="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <p style="color:#B8860B;font-family:serif;font-size:18px;margin:0;direction:rtl;">المحتوى محمي</p>
    `;
    document.body.appendChild(overlay);

    let hideTimer: NodeJS.Timeout | null = null;

    const showOverlay = (duration = 2500) => {
      if (hideTimer) clearTimeout(hideTimer);
      overlay.style.display = "flex";
      hideTimer = setTimeout(() => { overlay.style.display = "none"; }, duration);
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(" ").catch(() => {});
      }
    };

    /* ── Context menu ───────────────────────────────── */
    const onCtxMenu = (e: MouseEvent) => e.preventDefault();

    /* ── Keyboard shortcuts ──────────────────────────── */
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        showOverlay(2500);
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (["p", "s", "u", "a", "c"].includes(k)) {
          e.preventDefault(); e.stopPropagation(); return;
        }
        if (e.shiftKey && ["i", "j", "c", "k", "m"].includes(k)) {
          e.preventDefault(); e.stopPropagation(); return;
        }
      }
      if (e.key === "F12") { e.preventDefault(); return; }
      if (e.metaKey && e.code === "PrintScreen") { e.preventDefault(); showOverlay(2000); return; }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen") showOverlay(2000);
    };

    /* ── DevTools detection ──────────────────────────── */
    let devtoolsOpen = false;
    const devtoolsThreshold = 160;
    const checkDevtools = () => {
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
      const nowOpen = widthDiff > devtoolsThreshold || heightDiff > devtoolsThreshold;
      if (nowOpen !== devtoolsOpen) {
        devtoolsOpen = nowOpen;
        if (nowOpen) showOverlay(3000);
      }
    };
    const devtoolsInterval = setInterval(checkDevtools, 500);
    window.addEventListener("resize", checkDevtools);

    /* ── Window blur (catches Snipping Tool / OS screenshots) ── */
    const onBlur = () => {
      document.body.style.filter = "blur(8px)";
      document.body.style.transition = "filter 0.1s ease";
      showOverlay(3000);
    };

    const onFocus = () => {
      document.body.style.filter = "";
      overlay.style.display = "none";
    };

    /* ── Mouse leave (catches user moving to screenshot app) ── */
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        showOverlay(2000);
      }
    };

    /* ── Visibility change ───────────────────────────── */
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        showOverlay(3000);
      }
    };

    /* ── Drag & drop ─────────────────────────────────── */
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onDragOver = (e: DragEvent) => e.preventDefault();

    /* ── Mobile ───────────────────────────────────────── */
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 2) { e.preventDefault(); showOverlay(2000); }
    };

    /* ── Selection ────────────────────────────────────── */
    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") e.preventDefault();
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", (e: DragEvent) => e.preventDefault());
    document.addEventListener("contextmenu", onCtxMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("touchstart", onTouchStart, { passive: false });

    return () => {
      clearInterval(devtoolsInterval);
      if (hideTimer) clearTimeout(hideTimer);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", checkDevtools);
      document.removeEventListener("contextmenu", onCtxMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("touchstart", onTouchStart);
      document.getElementById("__as_style")?.remove();
      document.getElementById("__as_overlay")?.remove();
    };
  }, []);

  return null;
}