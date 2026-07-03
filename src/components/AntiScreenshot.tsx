"use client";

import { useEffect } from "react";

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

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.code === "PrintScreen") {
        e.preventDefault();
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (["p", "s", "u", "a", "c"].includes(e.key.toLowerCase())) { e.preventDefault(); e.stopPropagation(); return; }
        if (e.shiftKey && ["i", "j", "c", "k", "m"].includes(e.key.toLowerCase())) { e.preventDefault(); e.stopPropagation(); return; }
      }
      if (e.key === "F12") { e.preventDefault(); return; }
    };

    const onCtxMenu = (e: MouseEvent) => e.preventDefault();
    const onSelectStart = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA") e.preventDefault();
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 2) e.preventDefault();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("contextmenu", onCtxMenu);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("dragstart", (e) => e.preventDefault());
    document.addEventListener("dragover", (e) => e.preventDefault());
    document.addEventListener("drop", (e) => e.preventDefault());

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("contextmenu", onCtxMenu);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("touchstart", onTouchStart);
      document.getElementById("__as_style")?.remove();
    };
  }, []);

  return null;
}
