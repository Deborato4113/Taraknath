"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

export default function ItemSlider({ items }) {
  const trackRef = useRef(null);
  const [openTip, setOpenTip] = useState(null);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Scroll controls */}
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={() => scroll(-1)}
          className="w-9 h-9 flex items-center justify-center border border-gray-300 text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => scroll(1)}
          className="w-9 h-9 flex items-center justify-center border border-gray-300 text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth slider-track"
      >
        {items.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className="snap-start flex-shrink-0 w-[230px] bg-white border border-gray-200 hover:border-blue-800 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            {/*
              ============================================================
              IMAGE PLACEHOLDER — replace with Next.js <Image> when ready
              ============================================================
              Example replacement:
                import Image from "next/image";
                <div className="relative aspect-[4/3]">
                  <Image
                    src="/images/your-image.jpg"
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ============================================================
            */}
            <div className="aspect-[4/3] bg-gray-100 border-b border-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-[10px] tracking-widest uppercase mono">
                Image Placeholder
              </span>
            </div>

            <div className="p-4">
              <p className="font-bold text-gray-900 text-sm heading-font uppercase leading-snug min-h-[40px]">
                {item.name}
              </p>
              <p className="mono text-[10px] text-blue-800 tracking-wide uppercase mt-2 mb-4">
                {item.tag}
              </p>

              {/* Read More with hover tooltip */}
              <div
                className="relative"
                onMouseEnter={() => setOpenTip(i)}
                onMouseLeave={() => setOpenTip(null)}
              >
                <button className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-white bg-gray-900 hover:bg-red-600 transition-colors px-4 py-2.5">
                  <Info size={12} /> Read More
                </button>

                {/* Tooltip — appears on hover, disappears on leave */}
                <div
                  className={`absolute bottom-full left-0 right-0 mb-2 bg-gray-900 text-gray-200 text-xs leading-relaxed p-3 shadow-xl z-20 transition-all duration-200 origin-bottom ${
                    openTip === i
                      ? "opacity-100 scale-100 visible"
                      : "opacity-0 scale-95 invisible pointer-events-none"
                  }`}
                >
                  {item.desc}
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-6 w-2.5 h-2.5 bg-gray-900 rotate-45 -mt-1.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
