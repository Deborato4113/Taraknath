"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

// Drop this on any product card or detail page. `saved` is the initial
// state (the parent already knows whether this product is wishlisted,
// from whatever list it fetched) — this component just toggles it and
// calls the API, it doesn't fetch the initial state itself.
export default function WishlistButton({ productId, saved: initialSaved, className = "", size = 18 }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [saved, setSaved] = useState(!!initialSaved);
  const [loading, setLoading] = useState(false);

  async function handleClick(e) {
    e.preventDefault(); // in case this sits inside a <Link> product card
    e.stopPropagation();

    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);
    const wasSaved = saved;
    setSaved(!wasSaved); // optimistic — feels instant

    try {
      if (wasSaved) {
        await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      }
    } catch {
      setSaved(wasSaved); // revert on failure
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center transition-colors disabled:opacity-60 ${className}`}
    >
      <Heart size={size} className={saved ? "fill-red-600 text-red-600" : "text-gray-400"} />
    </button>
  );
}
