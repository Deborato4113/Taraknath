"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function ProductDetailPage({ item, category, categoryName, prevSlug, nextSlug }) {
  const thumbs = item.images?.length ? item.images : item.image ? [item.image] : [];
  const [activeThumb, setActiveThumb] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const { addToCart } = useCart();
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addedOnce, setAddedOnce] = useState(false);

  async function handleAddToCart() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    setAdding(true);
    const res = await addToCart(item.id, 1);
    setAdding(false);
    if (res.ok) {
      setAdded(true);
      setAddedOnce(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  // prevSlug/nextSlug are null at the ends of the category's product list

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link
            href={`/products/${category}`}
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to {categoryName}
          </Link>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image src="/logo.png" alt="Taraknath Engineering Works logo" fill sizes="32px" className="object-contain" />
            </div>
            <span className="hidden sm:block text-xs font-bold tracking-widest uppercase heading-font">
              Taraknath Engineering Works
            </span>
          </Link>
        </div>
      </div>
      <div className="h-1 w-full bg-blue-800" />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-400 mono">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/products/${category}`} className="hover:text-red-600">{categoryName}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{item.name}</span>
        </p>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-14 items-start">

          {/* LEFT — thumbnails + main image */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {/* Thumbnail strip — horizontal scroll on mobile, vertical column on sm+ */}
            {thumbs.length > 1 && (
              <div
                className="flex sm:flex-col gap-2 flex-shrink-0 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto pb-1 sm:pb-0"
                style={{ maxHeight: "440px", scrollbarWidth: "thin" }}
              >
                {thumbs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThumb(i)}
                    className={`w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] flex-shrink-0 relative overflow-hidden border-2 transition-all ${
                      activeThumb === i
                        ? "border-red-600 shadow-sm scale-105"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image src={img} alt={`${item.name} view ${i + 1}`} fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative min-w-0">
              <div
                className="bg-gray-100 border border-gray-200 relative overflow-hidden sm:cursor-crosshair w-full h-[300px] sm:h-[380px] lg:h-[440px]"
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={handleMouseMove}
              >
                {thumbs.length > 0 ? (
                  <Image
                    src={thumbs[activeThumb]}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 600px"
                    className="object-contain p-4 pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="mono text-[11px] text-gray-300 tracking-widest uppercase">
                      Image Placeholder
                    </span>
                  </div>
                )}

                {/* Lens (desktop only) */}
                {showZoom && thumbs.length > 0 && (
                  <div
                    className="absolute w-20 h-20 border-2 border-red-500 bg-red-500/10 pointer-events-none hidden sm:block"
                    style={{
                      left: `calc(${position.x}% - 40px)`,
                      top: `calc(${position.y}% - 40px)`,
                    }}
                  />
                )}

                {/* Left arrow */}
                {thumbs.length > 1 && activeThumb > 0 && (
                  <button
                    onClick={() => setActiveThumb((i) => i - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-red-600 transition-all z-20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                {/* Right arrow */}
                {thumbs.length > 1 && activeThumb < thumbs.length - 1 && (
                  <button
                    onClick={() => setActiveThumb((i) => i + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-gray-700 hover:text-red-600 transition-all z-20"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>

              {/* Zoom panel — floats to the right of the entire left column */}
              {showZoom && thumbs.length > 0 && (
                <div
                  className="absolute top-0 w-[380px] h-[440px] bg-white border border-gray-200 shadow-2xl overflow-hidden z-30 pointer-events-none hidden xl:block"
                  style={{ left: "calc(100% + 16px)" }}
                >
                  <img
                    src={thumbs[activeThumb]}
                    alt="zoom"
                    style={{
                      position: "absolute",
                      width: "300%",
                      height: "300%",
                      maxWidth: "none",
                      left: `-${position.x * 2}%`,
                      top: `-${position.y * 2}%`,
                      objectFit: "contain",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — product info */}
          <div className="flex flex-col">
            <p className="mono text-[10px] text-blue-800 tracking-widest uppercase mb-2">
              {item.tag}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase leading-tight mb-2">
              {item.name}
            </h1>
            <p className="text-xs text-gray-400 mono mb-5">
              Manufactured by Taraknath Engineering Works · ISO 9001:2015
            </p>

            <div className="h-px bg-gray-200 mb-5" />

            <h2 className="text-xs font-bold tracking-widest uppercase text-gray-900 mb-2">
              Product Description
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{item.desc}</p>

            {item.isBuyable && (
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-2xl font-bold text-gray-900 heading-font">
                  ₹{Number(item.price).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-gray-400 mono uppercase">Inclusive of taxes</span>
              </div>
            )}

            <div className="h-px bg-gray-200 mb-5" />

            <div className="space-y-3 mb-7">
              {[
                ["Manufacturer", "Taraknath Engineering Works"],
                ["Certification", "ISO 9001:2015"],
                ["Category", categoryName],
                ["Project Tag", item.tag],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-3 text-sm">
                  <span className="font-semibold text-gray-900 w-32 flex-shrink-0">{label}</span>
                  <span className="text-gray-500">{val}</span>
                </div>
              ))}
            </div>

            {item.isBuyable && (
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="inline-flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
                >
                  <ShoppingCart size={15} />
                  {added ? "Added to Cart ✓" : adding ? "Adding..." : "Add to Cart"}
                </button>

                {addedOnce && (
                  <Link
                    href="/cart"
                    className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-widest uppercase text-blue-800 border border-blue-800 hover:bg-blue-800 hover:text-white transition-colors px-7 py-4"
                  >
                    Go to Cart →
                  </Link>
                )}
              </div>
            )}

            <Link
              href={`/contact?category=${encodeURIComponent(category)}&product=${encodeURIComponent(item.name)}`}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-4"
            >
              Help
            </Link>

            {/* Prev / Next navigation */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
              {prevSlug ? (
                <Link
                  href={`/products/${category}/${prevSlug}`}
                  className="flex-1 inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-600 border border-gray-200 px-4 py-3 hover:border-red-600 hover:text-red-600 transition-colors"
                >
                  <ChevronLeft size={14} /> Previous
                </Link>
              ) : <div className="flex-1" />}

              {nextSlug && (
                <Link
                  href={`/products/${category}/${nextSlug}`}
                  className="flex-1 inline-flex items-center justify-end gap-2 text-xs font-semibold tracking-widest uppercase text-gray-600 border border-gray-200 px-4 py-3 hover:border-red-600 hover:text-red-600 transition-colors"
                >
                  Next <ChevronRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}