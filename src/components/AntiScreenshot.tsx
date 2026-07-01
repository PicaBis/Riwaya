"use client";

import { useEffect } from "react";

/**
 * Block ALL screenshot tools by:
 * 1. Showing black overlay on blur/visibility/PrintScreen/mouseleave
 * 2. Replacing clipboard content with WHITE IMAGE after ANY screenshot attempt
 * 3. Contaminating clipboard on PrintScreen key + focus return + visibility return
 * 4. Long overlay duration to cover screenshot tool timing
 * 5. DevTools detection + keyboard shortcuts + selection blocking
 */
export function AntiScreenshot() {
  useEffect(() => {
    /* ── CSS injection ──────────────────────────────── */
    const style = document.createElement("style");
    style.id = "__as_style";
    style.textContent = `
      @media print { html, body, * { display: none !important; visibility: hidden !important; } body::before { display: block !important; visibility: visible !important; content: "© محمي - روايتي"; font-size: 24px; text-align: center; padding-top: 40vh; color: #111; } }
      * { -webkit-user-select: none !important; user-select: none !important; }
      input, textarea { -webkit-user-select: text !important; user-select: text !important; }
    `;
    document.head.appendChild(style);

    /* ── Overlay ────────────────────────────────────── */
    const overlay = document.createElement("div");
    overlay.id = "__as_overlay";
    Object.assign(overlay.style, {
      position: "fixed", inset: "0", zIndex: "999999",
      background: "#0F0E0C", display: "none",
      alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px",
    });
    overlay.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8860B" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <p style="color:#B8860B;font-family:serif;font-size:18px;margin:0;direction:rtl;">المحتوى محمي</p>
    `;
    document.body.appendChild(overlay);

    let hideTimer: NodeJS.Timeout | null = null;
    const showOverlay = (duration = 2500) => {
      if (hideTimer) clearTimeout(hideTimer);
      overlay.style.display = "flex";
      hideTimer = setTimeout(() => { overlay.style.display = "none"; }, duration);
    };

    /* ── Create white image for clipboard ────────────── */
    const createWhiteBlob = async (): Promise<Blob> => {
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 1920, 1080);
      }
      return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
    };

    /* ── Poison clipboard with white image ───────────── */
    const poisonClipboard = async () => {
      try {
        const blob = await createWhiteBlob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      } catch {}
    };

    /* ── Poison clipboard repeatedly ─────────────────── */
    const poisonClipboardRepeatedly = (count: number, delayMs: number) => {
      for (let i = 0; i < count; i++) {
        setTimeout(() => poisonClipboard(), i * delayMs);
      }
    };

    /* ── Context menu ────────────────────────────────── */
    const onCtxMenu = (e: MouseEvent) => e.preventDefault();

    /* ── Keyboard ────────────────────────────────────── */
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        showOverlay(3000);
        poisonClipboardRepeatedly(5, 200);
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (["p", "s", "u", "a", "c"].includes(k)) { e.preventDefault(); e.stopPropagation(); return; }
        if (e.shiftKey && ["i", "j", "c", "k", "m"].includes(k)) { e.preventDefault(); e.stopPropagation(); return; }
      }
      if (e.key === "F12") { e.preventDefault(); return; }
      if (e.metaKey && e.code === "PrintScreen") { e.preventDefault(); showOverlay(3000); poisonClipboardRepeatedly(5, 200); return; }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        showOverlay(2500);
        poisonClipboardRepeatedly(5, 200);
      }
    };

    /* ── DevTools detection ──────────────────────────── */
    let devtoolsOpen = false;
    const checkDevtools = () => {
      const w = Math.abs(window.outerWidth - window.innerWidth);
      const h = Math.abs(window.outerHeight - window.innerHeight);
      const now = w > 160 || h > 160;
      if (now !== devtoolsOpen) { devtoolsOpen = now; if (now) { showOverlay(3000); poisonClipboard(); } }
    };
    const dtInterval = setInterval(checkDevtools, 500);
    window.addEventListener("resize", checkDevtools);

    /* ── Window blur (Snipping Tool / OS screenshot) ──── */
    const onBlur = () => {
      document.body.style.filter = "blur(8px)";
      document.body.style.transition = "filter 0.1s ease";
      showOverlay(4000);
      poisonClipboardRepeatedly(8, 300);
    };

    const onFocus = () => {
      document.body.style.filter = "";
      overlay.style.display = "none";
      setTimeout(() => poisonClipboardRepeatedly(4, 500), 1000);
    };

    /* ── Mouse leave ─────────────────────────────────── */
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        showOverlay(3000);
        poisonClipboardRepeatedly(4, 400);
      }
    };

    /* ── Visibility ──────────────────────────────────── */
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        showOverlay(4000);
        poisonClipboardRepeatedly(6, 300);
      } else {
        setTimeout(() => poisonClipboardRepeatedly(4, 400), 1200);
      }
    };

    /* ── Block clipboard read ────────────────────────── */
    const onCopy = (e: ClipboardEvent) => {
      if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        poisonClipboard();
      }
    };

    /* ── Drag ────────────────────────────────────────── */
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onDragOver = (e: DragEvent) => e.preventDefault();

    /* ── Mobile ──────────────────────────────────────── */
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 2) { e.preventDefault(); showOverlay(2500); poisonClipboardRepeatedly(3, 300); }
    };

    /* ── Selection ───────────────────────────────────── */
    const onSelectStart = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") e.preventDefault();
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("copy", onCopy);
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
      clearInterval(dtInterval);
      if (hideTimer) clearTimeout(hideTimer);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("copy", onCopy);
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