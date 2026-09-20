"use client";

import { useState } from "react";
import { Star } from "lucide-react";

// Dual-purpose: read-only display (pass `value`, a number, possibly with
// a decimal like 4.3 — partial stars aren't rendered, it just rounds) or
// an interactive picker (pass `onChange` to make it clickable).
export default function StarRating({ value = 0, onChange, size = 16 }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === "function";
  const display = interactive && hover ? hover : Math.round(value);

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          aria-label={interactive ? `Rate ${n} star${n > 1 ? "s" : ""}` : undefined}
        >
          <Star
            size={size}
            className={n <= display ? "fill-amber-400 text-amber-400" : "fill-none text-gray-300"}
          />
        </button>
      ))}
    </div>
  );
}
