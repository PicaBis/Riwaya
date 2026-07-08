"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

/**
 * Live count of guests currently present on the site, powered by Supabase
 * Realtime Presence (no table needed). Renders nothing if Supabase is not
 * configured, so it degrades gracefully.
 */
export function OnlineGuests({ className = "" }: { className?: string }) {
  const { guest, lang } = useApp();
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Unique, stable-per-tab presence key.
    const key = `${guest?.name || "guest"}-${Math.floor(performance.now())}-${Math.floor(performance.timeOrigin)}`;
    const channel = supabase.channel("online-guests", {
      config: { presence: { key } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
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

  if (count <= 0) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 ${fontClass} ${className}`}
      title={t("online.title", lang)}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <Users className="w-3.5 h-3.5" />
      {count} {t("online.now", lang)}
    </span>
  );
}
