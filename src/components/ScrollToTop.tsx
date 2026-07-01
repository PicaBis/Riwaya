"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (!visible) return null;

  return (
    <button
      onClick={scrollUp}
      aria-label="الرجوع للأعلى"
      className="fixed bottom-20 right-6 z-40 w-10 h-10 rounded-xl bg-gold-500 hover:bg-gold-600 shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-90 animate-fade-in"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}