"use client";

import { useEffect } from "react";

/**
 * Silent screenshot protection — works entirely in background.
 * No visible overlay, no flicker, no interruptions.
 * Just clipboard poisoning: any screenshot copies get replaced with white.
 */
export function AntiScreenshot() {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "__as_style";
    style.textContent = `
      @media print { html, body, * { display: none !important; visibility: hidden !important; } }
      * { -webkit-user-select: none !important; user-select: none !important; }
      input, textarea { -webkit-user-select: text !important; user-select: text !important; }
    `;
    document.head.appendChild(style);

    const createWhiteBlob = async (): Promise<Blob> => {
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, 1920, 1080); }
      return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
    };

    const poisonClipboard = async () => {
      try {
        const blob = await createWhiteBlob();
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      } catch {}
    };

    const poisonRepeatedly = (count: number, ms: number) => {
      for (let i = 0; i < count; i++) setTimeout(poisonClipboard, i * ms);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        poisonRepeatedly(6, 150);
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (["p", "s", "u", "a", "c"].includes(k)) { e.preventDefault(); e.stopPropagation(); return; }
        if (e.shiftKey && ["i", "j", "c", "k", "m"].includes(k)) { e.preventDefault(); e.stopPropagation(); return; }
      }
      if (e.key === "F12") { e.preventDefault(); return; }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen") poisonRepeatedly(4, 200);
    };

    const onBlur = () => poisonRepeatedly(10, 250);
    const onFocus = () => setTimeout(() => poisonRepeatedly(5, 400), 800);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") poisonRepeatedly(8, 250);
      else setTimeout(() => poisonRepeatedly(4, 350), 1000);
    };
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        poisonRepeatedly(5, 300);
      }
    };
    const onCopy = (e: ClipboardEvent) => {
      if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        poisonClipboard();
      }
    };
    const onCtxMenu = (e: MouseEvent) => e.preventDefault();
    const onSelectStart = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") e.preventDefault();
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 2) { e.preventDefault(); poisonRepeatedly(4, 250); }
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("copy", onCopy);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("contextmenu", onCtxMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("dragstart", (e) => e.preventDefault());
    document.addEventListener("dragover", (e) => e.preventDefault());
    document.addEventListener("drop", (e) => e.preventDefault());

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("contextmenu", onCtxMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("touchstart", onTouchStart);
      document.getElementById("__as_style")?.remove();
    };
  }, []);

  return null;
}