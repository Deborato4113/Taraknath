"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/quotes", label: "Quotes" },
  { href: "/admin/coupons", label: "Coupons" },
];

export default function AdminNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/admin" className="text-xs font-bold tracking-widest uppercase heading-font">
          Taraknath Admin
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 mono text-[11px] tracking-widest uppercase">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-red-400">{l.label}</Link>
          ))}
          <Link href="/" className="text-gray-400 hover:text-white">Back to site</Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="sm:hidden text-white"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden overflow-hidden transition-all duration-200 ${open ? "max-h-60" : "max-h-0"}`}>
        <nav className="flex flex-col border-t border-gray-800 mono text-xs tracking-widest uppercase">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-5 py-3.5 border-b border-gray-800 hover:bg-gray-800"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="px-5 py-3.5 text-gray-400 hover:bg-gray-800"
          >
            Back to site
          </Link>
        </nav>
      </div>
    </div>
  );
}
