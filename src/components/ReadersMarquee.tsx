"use client";

import { useEffect, useState } from "react";
import { Users, Sparkles, BookOpen, Feather } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { AUTHOR } from "@/lib/constants";

/**
 * Decorative animated strip for the home page. Shows a live count of readers
 * currently online (Supabase Realtime Presence, same channel as OnlineGuests)
 * plus a gently scrolling ribbon of literary phrases. Degrades gracefully:
 * if presence is unavailable the count pill is simply hidden.
 */
export function ReadersMarquee() {
  const { guest, lang } = useApp();
  const ar = lang === "ar";
  const fontClass = ar ? "font-arabic" : "font-sans";
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const key = `${guest?.name || "guest"}-${Math.floor(performance.now())}-${Math.floor(performance.timeOrigin)}`;
    const channel = supabase.channel("online-guests", { config: { presence: { key } } });
    channel
      .on("presence", { event: "sync" }, () => {
        setCount(Object.keys(channel.presenceState()).length);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.track({ online_at: Date.now(), name: guest?.name || "guest" });
        }
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [guest?.name]);

  const phrases = ar
    ? ["شجرة سينا", "قلادة القمر", "تجربة الحب السوداء", "الحرب الكبرى", "أسرار العالم", `بقلم ${AUTHOR.penName}`, "اقرأ الفصول الأولى مجاناً"]
    : ["Shajarat Sina", "The Moon's Necklace", "The Black Love Trial", "The Great War", "Secrets of the World", `by ${AUTHOR.penName}`, "Read the first chapters free"];

  const icons = [BookOpen, Feather, Sparkles];

  const track = (
    <div className="flex items-center gap-6 pe-6 shrink-0">
      {phrases.map((p, i) => {
        const Icon = icons[i % icons.length];
        return (
          <span key={i} className={`inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${fontClass}`}>
            <Icon className="w-3.5 h-3.5 text-gold-500/70" />
            {p}
          </span>
        );
      })}
    </div>
  );

  return (
    <div
      className="relative flex items-center gap-3 rounded-2xl border border-parchment-200 dark:border-white/8 bg-white/60 dark:bg-onyx-800/50 backdrop-blur-sm px-3 sm:px-4 py-2.5 overflow-hidden"
      dir={ar ? "rtl" : "ltr"}
    >
      {count > 0 && (
        <span
          className={`z-10 inline-flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-600 dark:text-green-400 ${fontClass}`}
          title={t("readers.reading", lang)}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <Users className="w-3.5 h-3.5" />
          {count} {t("readers.reading", lang)}
        </span>
      )}
      <div className="marquee-mask flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee">
          {track}
          {track}
        </div>
      </div>
    </div>
  );
}
