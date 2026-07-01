"use client";

import { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function TTSButton() {
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  const toggle = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    if (synth.speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    const text = document.querySelector(".pdf-viewer-canvas")?.parentElement?.nextElementSibling?.textContent
      || document.querySelector("[class*=pdf]")?.textContent
      || "";

    const pageText = (document.querySelector(".pdf-viewer-canvas") as HTMLCanvasElement)?.getAttribute("data-text") || "";

    if (!pageText && !text) {
      alert("لا يوجد نص للقراءة الصوتية في هذا العرض");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(pageText || text.slice(0, 1000));
    utterance.lang = "ar-SA";
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (!voicesLoadedRef.current) {
      const voices = synth.getVoices();
      const arVoice = voices.find((v) => v.lang.startsWith("ar"));
      if (arVoice) utterance.voice = arVoice;
      voicesLoadedRef.current = true;
    }

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    synthRef.current = utterance;
    synth.speak(utterance);
    setSpeaking(true);
  };

  return (
    <button
      onClick={toggle}
      title={speaking ? "إيقاف القراءة الصوتية" : "قراءة صوتية"}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-arabic transition-colors ${
        speaking
          ? "bg-gold-500/10 text-gold-500 border border-gold-500/20"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-parchment-100 dark:hover:bg-white/10"
      }`}
    >
      {speaking ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{speaking ? "إيقاف" : "قراءة صوتية"}</span>
    </button>
  );
}