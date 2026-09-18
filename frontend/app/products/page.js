"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import Footer from "../../components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const SORT_OPTIONS = [
  { value: "", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function ProductsSearchPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Category list for the filter dropdown — fetched once.
  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Debounce the search box — wait 400ms after the user stops typing
  // before it actually triggers a fetch, so every keystroke doesn't
  // hit the server.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Re-fetch whenever any filter changes (the debounced query, not the
  // raw one, is what's in this dependency list).
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", "true");
    if (sort) params.set("sort", sort);

    setProducts(null);
    fetch(`${API_URL}/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return setError(data.error);
        setProducts(data);
      })
      .catch(() => setError("Failed to load products"));
  }, [debouncedQuery, category, minPrice, maxPrice, inStock, sort]);

  const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800";
  const labelClass = "block mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5";

  function clearFilters() {
    setCategory(""); setMinPrice(""); setMaxPrice(""); setInStock(false); setSort("");
  }

  const activeFilterCount = [category, minPrice, maxPrice, inStock].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image src="/logo.png" alt="Taraknath Engineering Works logo" fill sizes="32px" className="object-contain" />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase heading-font">
              Taraknath Engineering Works
            </span>
          </Link>
        </div>
      </div>
      <div className="h-1 w-full bg-blue-800" />

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
          <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2">
            Product Catalogue
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 heading-font uppercase mb-6">
            Search All Products
          </h1>

          <div className="relative max-w-xl">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, description or SKU…"
              className="w-full border border-gray-300 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-800 bg-white"
            />
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-blue-800" />

      <div className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="lg:hidden flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-700 mb-4"
            >
              <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            <div className={`${filtersOpen ? "flex" : "hidden"} lg:flex flex-col gap-6`}>
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Price Range (₹)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className={inputClass}
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
                In stock only
              </label>

              <div>
                <label className={labelClass}>Sort By</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputClass}>
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs font-semibold text-blue-800 hover:underline text-left">
                  Clear filters
                </button>
              )}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            {!products ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-gray-500">No products match your search.</p>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-6">{products.length} result(s)</p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.category.slug}/${p.slug}`}
                      className="border border-gray-200 hover:border-blue-800 transition-colors bg-white group"
                    >
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        {p.images?.[0] ? (
                          <Image
                            src={p.images[0].url}
                            alt={p.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="mono text-[9px] text-gray-300 tracking-widest uppercase">
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="mono text-[10px] text-blue-800 tracking-widest uppercase mb-1">
                          {p.category.name}
                        </p>
                        <h3 className="font-bold text-gray-900 text-sm heading-font uppercase leading-snug mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                          {p.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">
                            {p.price ? `₹${Number(p.price).toLocaleString("en-IN")}` : "Quote on Request"}
                          </span>
                          {p.stock < 1 && (
                            <span className="text-[10px] font-semibold text-red-600 uppercase">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
