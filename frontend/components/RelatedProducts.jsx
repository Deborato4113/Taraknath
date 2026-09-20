"use client";

import Image from "next/image";
import Link from "next/link";

// Reusable "You may also like" / "Frequently bought together" grid.
// `items` shape matches lib/api.js's adaptProduct(): {id, slug, name,
// image, price, isBuyable}. `categorySlug` can be a fixed string (product
// page, every item is in the same category) or a function
// (item) => slug (cart page, items can span categories).
export default function RelatedProducts({ title, items, categorySlug }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-12 pt-10 border-t border-gray-200">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 heading-font uppercase mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {items.map((item) => {
          const slug = typeof categorySlug === "function" ? categorySlug(item) : categorySlug;
          const href = slug ? `/products/${slug}/${item.slug}` : "#";

          return (
            <Link
              key={item.id}
              href={href}
              className="group border border-gray-200 hover:border-red-300 transition-colors flex flex-col"
            >
              <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-3 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="mono text-[9px] text-gray-300 tracking-widest uppercase">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 heading-font uppercase line-clamp-2 mb-1">
                  {item.name}
                </p>
                {item.isBuyable && item.price != null && (
                  <p className="mt-auto text-sm font-bold text-gray-900">
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
