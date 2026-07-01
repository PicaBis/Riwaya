"use client";

import { useEffect, useState, useRef } from "react";
import { Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function ReadingTimer() {
  const { addReadingTime, totalReadingTime } = useApp();
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((p) => p + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (elapsed > 0) addReadingTime(elapsed);
    };
  }, []);

  const total = totalReadingTime + elapsed;
  const mins = Math.floor(total / 60);
  const secs = total % 60;

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5 text-gold-500/60" />
      <span className="text-xs text-gray-400 font-sans font-medium">
        {mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : `${secs}s`}
      </span>
    </div>
  );
}