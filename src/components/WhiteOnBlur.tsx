"use client";

import { useEffect, useRef, useState } from "react";

export function WhiteOnBlur() {
  const [showWhite, setShowWhite] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const clearTimers = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };

    const reveal = () => {
      clearTimers();
      setShowWhite(false);
    };

    const blank = (duration = 2500) => {
      clearTimers();
      setShowWhite(true);
      const t = window.setTimeout(reveal, duration);
      timersRef.current.push(t);
    };

    const onBlur = () => blank(3000);
    const onVisibility = () => {
      if (document.hidden) blank(3000);
      else reveal();
    };
    const onFocus = () => reveal();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        e.stopPropagation();
        blank(600);
      }
    };

    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("focus", onFocus);
      clearTimers();
    };
  }, []);

  if (!showWhite) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#ffffff",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
