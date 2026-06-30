"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";

interface StarRatingProps {
  novelId: string;
  initialRating?: number;
  onRate?: (stars: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  novelId,
  initialRating = 0,
  onRate,
  readOnly = false,
  size = "md",
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const [rating, setRating] = useState(initialRating);

  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  const handleClick = (star: number) => {
    if (readOnly) return;
    setRating(star);
    onRate?.(star);
  };

  const displayRating = hovered || rating;

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => !readOnly && setHovered(0)}
      role="group"
      aria-label={`تقييم ${rating} من 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          className={clsx(
            "transition-transform duration-100",
            !readOnly && "hover:scale-110 cursor-pointer",
            readOnly && "cursor-default"
          )}
          aria-label={`${star} نجوم`}
        >
          <Star
            className={clsx(
              sizeClass,
              "transition-colors duration-150",
              star <= displayRating
                ? "fill-gold-500 text-gold-500"
                : "fill-transparent text-gray-300 dark:text-gray-600"
            )}
          />
        </button>
      ))}
      {!readOnly && rating > 0 && (
        <span className="text-xs text-gray-400 dark:text-gray-500 ms-1 font-sans">
          ({rating}/5)
        </span>
      )}
    </div>
  );
}
