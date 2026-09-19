"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingCart } from "lucide-react";
import Header from "../../../components/Header";
import { useCart } from "../../../components/CartContext";

export default function WishlistPage() {
  const { status } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();

  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return setError(data.error);
        setItems(data);
      });
  }, []);

  async function handleRemove(productId) {
    setRemovingId(productId);
    const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
    setRemovingId(null);
    if (res.ok) setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  async function handleMoveToCart(productId) {
    setMovingId(productId);
    const res = await addToCart(productId, 1);
    setMovingId(null);
    if (res.ok) {
      await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      <div className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-8 py-16">
        <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2 text-center">
          Account
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8 text-center">
          My Wishlist
        </h1>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        {!items ? (
          <p className="text-sm text-gray-400 text-center">Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6">You haven't saved anything yet.</p>
            <Link
              href="/#products"
              className="inline-block bg-gray-900 hover:bg-red-600 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(({ product }) => (
              <div key={product.id} className="border border-gray-200 bg-white flex flex-col">
                <Link
                  href={`/products/${product.category.slug}/${product.slug}`}
                  className="aspect-square bg-gray-100 relative overflow-hidden"
                >
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="mono text-[9px] text-gray-300 tracking-widest uppercase">No Image</span>
                    </div>
                  )}
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <p className="mono text-[10px] text-blue-800 tracking-widest uppercase mb-1">
                    {product.category.name}
                  </p>
                  <Link
                    href={`/products/${product.category.slug}/${product.slug}`}
                    className="font-bold text-gray-900 text-sm heading-font uppercase leading-snug mb-2 hover:text-red-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm font-bold text-gray-900 mb-4">
                    {product.price ? `₹${Number(product.price).toLocaleString("en-IN")}` : "Quote on Request"}
                  </p>

                  <div className="mt-auto flex items-center gap-2">
                    {product.isBuyable && product.stock > 0 ? (
                      <button
                        onClick={() => handleMoveToCart(product.id)}
                        disabled={movingId === product.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 transition-colors text-white text-[11px] font-semibold tracking-widest uppercase px-3 py-2.5"
                      >
                        <ShoppingCart size={13} />
                        {movingId === product.id ? "Moving…" : "Move to Cart"}
                      </button>
                    ) : (
                      <span className="flex-1 text-[11px] text-gray-400 uppercase tracking-widest text-center py-2.5">
                        {product.isBuyable ? "Out of Stock" : "Quote Only"}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(product.id)}
                      disabled={removingId === product.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 p-2.5"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
