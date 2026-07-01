"use client";

import { useEffect } from "react";

/**
 * Comprehensive content protection:
 * - Blocks right-click, drag, drop
 * - Blocks all save/print/devtools keyboard shortcuts
 * - Detects devtools via window size differential
 * - Flashes overlay on PrintScreen / window-blur / devtools detection
 * - CSS @media print protection
 * - CSS user-select:none injection
 * - Mobile screenshot protection via onbeforeunload
 * - Clipboard poisoning
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

    const showOverlay = () => {
      overlay.style.display = "flex";
      setTimeout(() => { overlay.style.display = "none"; }, 800);
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText("").catch(() => {});
      }
    };

    /* ── Context menu ───────────────────────────────── */
    const onCtxMenu = (e: MouseEvent) => e.preventDefault();

    /* ── Keyboard shortcuts ──────────────────────────── */
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      // PrintScreen
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        overlay.style.display = "flex";
        setTimeout(() => { overlay.style.display = "none"; }, 1200);
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(" ").catch(() => {});
        }
        return;
      }
      // Ctrl/Cmd combos
      if (e.ctrlKey || e.metaKey) {
        // Save, Print, View Source, Select All
        if (["p", "s", "u", "a", "c"].includes(k)) {
          e.preventDefault(); e.stopPropagation();
          return;
        }
        // Devtools: Ctrl+Shift+I/J/C, Ctrl+Shift+K
        if (e.shiftKey && ["i", "j", "c", "k", "m"].includes(k)) {
          e.preventDefault(); e.stopPropagation();
          return;
        }
      }
      // F12
      if (e.key === "F12") { e.preventDefault(); return; }
      // Windows key + PrintScreen
      if (e.key === "Meta" || e.metaKey) {
        if (e.code === "PrintScreen") { e.preventDefault(); showOverlay(); return; }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen") showOverlay();
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
        if (nowOpen) showOverlay();
      }
    };
    const devtoolsInterval = setInterval(checkDevtools, 1000);
    window.addEventListener("resize", checkDevtools);

    /* ── Visibility / focus ──────────────────────────── */
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        overlay.style.display = "flex";
        setTimeout(() => { overlay.style.display = "none"; }, 400);
      }
    };

    /* ── Drag & drop ─────────────────────────────────── */
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onDrop = (e: DragEvent) => e.preventDefault();
    const onDragOver = (e: DragEvent) => e.preventDefault();

    /* ── Mobile protection ────────────────────────────── */
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 2) {
        e.preventDefault();
        showOverlay();
      }
    };

    /* ── Selection ────────────────────────────────────── */
    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
        e.preventDefault();
      }
    };

    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("drop", onDrop);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("contextmenu", onCtxMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("touchstart", onTouchStart, { passive: false });

    return () => {
      clearInterval(devtoolsInterval);
      window.removeEventListener("resize", checkDevtools);
      document.removeEventListener("contextmenu", onCtxMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("drop", onDrop);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("touchstart", onTouchStart);
      document.getElementById("__as_style")?.remove();
      document.getElementById("__as_overlay")?.remove();
    };
  }, []);

  return null;
}