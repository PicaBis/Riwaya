"use client";

import { Bookmark } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function FavoriteButton({ novelId }: { novelId: string }) {
  const { favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(novelId);

  return (
    <button
      onClick={() => toggleFavorite(novelId)}
      title={isFav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
      className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-150 active:scale-95 ${
        isFav
          ? "bg-gold-500/10 border-gold-500 text-gold-500"
          : "border-parchment-300 dark:border-white/10 text-gray-400 hover:text-gold-500 hover:border-gold-500/30"
      }`}
    >
      <Bookmark className={`w-4 h-4 ${isFav ? "fill-gold-500" : ""}`} />
    </button>
  );
}