"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ShieldCheck, Wrench, Clock } from "lucide-react";

const BEARING_ICONS = [ShieldCheck, Wrench, Clock];

function BearingGrid({ items }) {
  return (
    <div className="grid sm:grid-cols-3 gap-6">
      {items.map((svc, i) => {
        const Icon = BEARING_ICONS[i];
        return (
          <div
            key={svc.name}
            className="bg-white border border-gray-200 hover:border-blue-800 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 p-8 relative"
          >
            <span className="absolute top-5 right-5 mono text-xs text-gray-200 font-semibold">0{i + 1}</span>
            <div className="w-12 h-12 bg-blue-800 flex items-center justify-center mb-5">
              <Icon className="text-white" size={20} />
            </div>
            <p className="font-bold text-gray-900 text-base mb-3 heading-font uppercase">{svc.name}</p>
            <p className="text-gray-500 text-sm leading-relaxed">{svc.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

function ProductList({ items, category }) {
  return (
    <div className="flex flex-col divide-y divide-gray-200 border border-gray-200">
      {items.map((item, i) => (
        <Link
          key={i}
          href={`/products/${category}/${i}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-5 sm:gap-8 p-5 sm:p-6 bg-white hover:bg-gray-50 transition-colors group"
        >
          {/* Product image */}
          <div className="w-[140px] sm:w-[180px] flex-shrink-0 aspect-square bg-gray-100 border border-gray-200 relative overflow-hidden">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="mono text-[9px] text-gray-300 tracking-widest uppercase text-center px-2">
                  Image Placeholder
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col flex-1 min-w-0 py-1">
            <p className="mono text-[10px] text-blue-800 tracking-widest uppercase mb-1.5">
              {item.tag}
            </p>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg heading-font uppercase leading-snug mb-2 group-hover:text-red-600 transition-colors">
              {item.name}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
              {item.desc}
            </p>

            <div className="mt-auto flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500">Available on Request</span>
              </div>
              <span className="mono text-[10px] text-gray-400 tracking-widest uppercase">
                ISO 9001:2015 Certified
              </span>
            </div>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-red-600 group-hover:gap-3 transition-all">
                View Full Detail <ArrowUpRight size={13} />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function CategoryPageClient({ category, meta }) {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>


      {/* Top bar */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <Link
            href="/#products"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to All Products
          </Link>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 flex items-center justify-center text-white font-bold text-xs heading-font">
              TE
            </div>
            <span className="hidden sm:block text-xs font-bold tracking-widest uppercase heading-font">
              Taraknath Engineering Works
            </span>
          </Link>
        </div>
      </div>
      <div className="h-1 w-full bg-blue-800" />

      {/* Page header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2">
            Product Catalogue
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 heading-font uppercase">
            {meta.name}
          </h1>
          {meta.kind === "items" && (
            <p className="text-gray-500 text-sm mt-2 mono">
              {meta.items.length} results · {meta.tag}
            </p>
          )}
        </div>
      </div>
      <div className="h-1 w-full bg-blue-800" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        {meta.kind === "bearing" ? (
          <BearingGrid items={meta.items} />
        ) : (
          <ProductList items={meta.items} category={category} />
        )}
      </div>

      {/* Footer strip */}
      <div className="h-1 w-full bg-blue-800" />
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex justify-between items-center text-xs text-gray-500 mono">
          <span>© 2026 Taraknath Engineering Works</span>
          <Link href="/#contact" className="hover:text-red-500">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
