"use client";

import { useEffect, useState } from "react";

/**
 * Thin gold progress bar fixed to the very top of the viewport that reflects
 * how far the user has scrolled through the page. GPU-friendly (scaleX) and
 * hidden until there is something to scroll.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      setProgress(height > 0 ? Math.min(scrollTop / height, 1) : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 shadow-[0_0_8px_rgba(184,134,11,0.5)]"
        style={{
          transform: `scaleX(${progress})`,
          transition: "transform 0.1s linear",
          opacity: progress > 0.005 ? 1 : 0,
          willChange: "transform",
        }}
      />
    </div>
  );
}
