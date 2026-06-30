"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle floating dot particles behind the hero section.
 * Uses canvas for performance. Respects prefers-reduced-motion.
 */
export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const isDark = () => document.documentElement.classList.contains("dark");

    // Particles
    const N = 28;
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: 0.15 + Math.random() * 0.25,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const color = isDark() ? "180, 134, 11" : "120, 90, 0";

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
