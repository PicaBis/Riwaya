"use client";

import { useEffect } from "react";

export function AntiScreenshot() {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "__as_style";
    style.textContent = `
      @media print { html, body, * { display: none !important; visibility: hidden !important; } }
      *, *::before, *::after { -webkit-user-select: none !important; user-select: none !important; -webkit-user-drag: none !important; }
      input, textarea { -webkit-user-select: text !important; user-select: text !important; }
      img, canvas, video { -webkit-user-drag: none !important; user-drag: none !important; pointer-events: none !important; }
      img::before, canvas::before { content: ""; }
    `;
    document.head.appendChild(style);

    const blockedShortcuts = new Set([
      "PrintScreen", "F5", "F12", "F11", "F10",
    ]);
    const blockedCtrl = new Set([
      "p", "s", "u", "a", "c", "w", "n", "t", "j", "l",
      "i", "k", "m", "y", "e", "g", "h", "f", "r", "d",
      "b", "v", "x", "z", "q",
    ]);
    const blockedCtrlShift = new Set([
      "i", "j", "c", "k", "m", "n", "t", "p", "s", "delete",
    ]);

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (blockedShortcuts.has(e.key) || blockedShortcuts.has(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (blockedCtrl.has(key)) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (e.shiftKey && blockedCtrlShift.has(key)) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
      if (e.key === "F12") { e.preventDefault(); e.stopPropagation(); return; }
      if (e.altKey && ["Tab", "F4"].includes(e.key)) { e.preventDefault(); return; }
    };

    const onCtxMenu = (e: MouseEvent) => e.preventDefault();
    const onSelectStart = (e: Event) => {
      const t = e.target as HTMLElement;
      if (!t || (t.tagName !== "INPUT" && t.tagName !== "TEXTAREA")) e.preventDefault();
    };
    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onCut = (e: ClipboardEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onPaste = (e: ClipboardEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDragStart = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDrop = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 2) { e.preventDefault(); }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        const now = Date.now();
        const last = (e.target as any)?.__lastTouch;
        if (last && now - last < 300) { e.preventDefault(); }
        (e.target as any).__lastTouch = now;
      }
    };
    const onBlur = () => {
      try { navigator.clipboard?.writeText(""); } catch {}
    };

    let devtoolsOpen = false;
    const threshold = 160;
    const detectDevTools = () => {
      const open = window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth < window.innerWidth ||
        window.outerHeight < window.innerHeight;
      if (open !== devtoolsOpen) {
        devtoolsOpen = open;
        document.body.style.filter = devtoolsOpen ? "blur(20px) saturate(0)" : "";
        document.body.style.pointerEvents = devtoolsOpen ? "none" : "";
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("contextmenu", onCtxMenu, true);
    document.addEventListener("selectstart", onSelectStart, true);
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("cut", onCut, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("dragstart", onDragStart, true);
    document.addEventListener("dragover", (e) => { e.preventDefault(); }, true);
    document.addEventListener("drop", onDrop, true);
    document.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchend", onTouchEnd, true);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", detectDevTools);
    window.addEventListener("scroll", detectDevTools, true);

    const devtoolsInterval = window.setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("contextmenu", onCtxMenu, true);
      document.removeEventListener("selectstart", onSelectStart, true);
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("cut", onCut, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("dragstart", onDragStart, true);
      document.removeEventListener("dragover", () => {}, true);
      document.removeEventListener("drop", onDrop, true);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", detectDevTools);
      window.removeEventListener("scroll", detectDevTools, true);
      window.clearInterval(devtoolsInterval);
      document.getElementById("__as_style")?.remove();
      document.body.style.filter = "";
      document.body.style.pointerEvents = "";
    };
  }, []);

  return null;
}
