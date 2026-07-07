"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Target value to count up to. */
  value: number;
  /** Animation duration in ms. */
  duration?: number;
  className?: string;
  /** Optional suffix/prefix rendered as-is (e.g. "%"). */
  suffix?: string;
  prefix?: string;
}

/**
 * Counts from 0 up to `value` the first time it scrolls into view.
 * Uses an eased rAF loop; respects prefers-reduced-motion (shows final value).
 */
export function CountUp({ value, duration = 1100, className = "", suffix = "", prefix = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    let rafId = 0;
    let startTs = 0;
    const run = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (t < 1) rafId = requestAnimationFrame(run);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            rafId = requestAnimationFrame(run);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
