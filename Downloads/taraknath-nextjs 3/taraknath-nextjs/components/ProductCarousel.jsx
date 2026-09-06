"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

function ProductDetail({ item, onBack }) {
  const [activeThumb, setActiveThumb] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef(null);

  const thumbs = item.images?.length ? item.images : [item.image];

  const handleMouseMove = (e) => {
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-500 hover:text-red-600 transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Products
      </button>

      <div className="grid lg:grid-cols-[48%_52%] gap-10 lg:gap-16 items-start">
        {/* LEFT — thumbnail strip + main image + zoom panel */}
        <div className="flex gap-4 relative">
          {/* Vertical thumbnail strip */}
          <div
            className="flex flex-col gap-3 flex-shrink-0 max-h-[600px] overflow-y-auto"
            style={{ scrollbarWidth: "thin" }}
          >
            {thumbs.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveThumb(i)}
                className={`w-[60px] h-[60px] border-2 flex-shrink-0 relative overflow-hidden transition-all ${
                  activeThumb === i
                    ? "border-red-600 shadow-md scale-105"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                aria-label={`Thumbnail ${i + 1}`}
              >
                <Image
                  src={img}
                  alt={`${item.name} view ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>

          {/* Main image — hover triggers zoom */}
          <div
            ref={imageRef}
            className="flex-1 bg-gray-100 border border-gray-200 relative overflow-hidden cursor-crosshair"
            style={{ height: "500px" }}
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <Image
              src={thumbs[activeThumb]}
              alt={item.name}
              fill
              className="object-contain p-4 pointer-events-none"
            />

            {/* Lens overlay — shows which area is zoomed */}
            {showZoom && (
              <div
                className="absolute w-24 h-24 border-2 border-red-500 bg-red-500/10 pointer-events-none"
                style={{
                  left: `calc(${position.x}% - 48px)`,
                  top: `calc(${position.y}% - 48px)`,
                }}
              />
            )}
          </div>

          {/* Zoom panel — appears to the RIGHT of the image area */}
          {showZoom && (
            <div
              className="absolute left-full ml-4 top-0 w-[380px] h-[500px] bg-white border border-gray-200 shadow-2xl overflow-hidden z-30 pointer-events-none hidden xl:block"
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${thumbs[activeThumb]})`,
                  backgroundSize: "300%",
                  backgroundPosition: `${position.x}% ${position.y}%`,
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
          )}
        </div>

        {/* RIGHT — product info */}
        <div className="flex flex-col">
          <p className="mono text-[10px] text-blue-800 tracking-widests uppercase mb-2">
            {item.tag}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase leading-tight mb-5">
            {item.name}
          </h3>

          <div className="h-px bg-gray-200 mb-5" />

          <h4 className="text-xs font-bold tracking-widest uppercase text-gray-900 mb-3">
            Product Description
          </h4>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{item.desc}</p>

          <div className="h-px bg-gray-200 mb-5" />

          <div className="space-y-3">
            {[
              ["Manufacturer", "Taraknath Engineering Works"],
              ["Certification", "ISO 9001:2015"],
              ["Category", item.tag],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-3 text-sm">
                <span className="font-semibold text-gray-900 w-32 flex-shrink-0">{label}</span>
                <span className="text-gray-500">{val}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-7 py-3.5">
              Request a Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductCarousel({ items, categoryName, initialItem = null }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedItem, setSelectedItem] = useState(initialItem);

  const prev = () => setCurrentIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setCurrentIdx((i) => (i + 1) % items.length);

  const item = items[currentIdx];

  if (selectedItem) {
    return (
      <ProductDetail
        item={selectedItem}
        onBack={() => setSelectedItem(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="mono text-[10px] text-gray-400 tracking-widest uppercase mb-1">
            {currentIdx + 1} / {items.length}
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 heading-font uppercase">
            {categoryName}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors"
            aria-label="Previous product"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors"
            aria-label="Next product"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Featured product card */}
      <div
        className="grid sm:grid-cols-2 gap-0 border border-gray-200 bg-white group cursor-pointer hover:border-red-600 transition-all duration-300 hover:shadow-xl"
        onClick={() => setSelectedItem(item)}
      >
        {/* Image area */}
        <div className="bg-gray-100 aspect-square sm:aspect-auto sm:min-h-[320px] relative overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-8 left-0 right-0 text-center z-10">
            <p className="mono text-[10px] text-gray-400 tracking-widest uppercase">
              Click to View Detail
            </p>
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentIdx(i); }}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIdx ? "bg-red-600 w-4" : "bg-gray-300 w-1.5"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Info area */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <p className="mono text-[10px] text-blue-800 tracking-widest uppercase mb-3">
              {item.tag}
            </p>
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 heading-font uppercase leading-tight mb-5">
              {item.name}
            </h4>
            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold tracking-widest uppercase text-red-600 flex items-center gap-2">
              View Full Detail →
            </span>
            <span className="mono text-[10px] text-gray-300 uppercase tracking-widest">
              {currentIdx + 1}/{items.length}
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnail strip below */}
      <div className="flex gap-3 mt-5 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
        {items.map((itm, i) => (
          <button
            key={i}
            onClick={() => setCurrentIdx(i)}
            className={`flex-shrink-0 w-[80px] border-2 transition-all ${
              i === currentIdx
                ? "border-red-600 shadow-md"
                : "border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-100"
            }`}
          >
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              <Image
                src={itm.image}
                alt={itm.name}
                fill
                className="object-cover"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
