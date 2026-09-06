"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", target: "home" },
  { label: "About", target: "about" },
  { label: "Products", target: "products" },
  { label: "Services", target: "services" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight nav link based on which section is in view (home page only)
  useEffect(() => {
    if (!isHome) return;
    const sectionIds = NAV_LINKS.map((l) => l.target);
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [isHome]);

  // Navigate to a section: scroll directly if already on the home page,
  // otherwise go to the home page and scroll to the section once there.
  const goToSection = (id) => {
    setMenuOpen(false);
    if (isHome) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(id === "home" ? "/" : `/#${id}`);
    }
  };

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-shadow ${
        scrolled ? "shadow-md" : "border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => goToSection("home")} className="flex items-center gap-3">
          <div className="w-10 h-10 relative flex-shrink-0">
            <Image src="/logo.png" alt="Taraknath Engineering Works logo" fill className="object-contain" />
          </div>
          <div className="leading-tight text-left">
            <span className="block font-bold text-gray-900 tracking-wide text-sm md:text-[15px] heading-font uppercase">
              Taraknath Engineering Works
            </span>
            <span className="block text-[10px] text-gray-400 mono tracking-widest">
              ISO 9001:2015 CERTIFIED
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-9 text-[11px] font-semibold tracking-[0.2em] uppercase">
          {NAV_LINKS.map(({ label, target }) => (
            <button
              key={target}
              onClick={() => goToSection(target)}
              className={`relative group transition-colors ${
                isHome && active === target ? "text-red-600" : "text-gray-600 hover:text-red-600"
              }`}
            >
              {label}
              <span
                className={`absolute -bottom-1.5 left-0 h-[2px] bg-red-600 transition-all ${
                  isHome && active === target ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
          <Link
            href="/contact"
            className={`relative group transition-colors ${
              !isHome ? "text-red-600" : "text-gray-600 hover:text-red-600"
            }`}
          >
            Contact
            <span
              className={`absolute -bottom-1.5 left-0 h-[2px] bg-red-600 transition-all ${
                !isHome ? "w-full" : "w-0 group-hover:w-full"
              }`}
            />
          </Link>
          <Link
            href="/contact"
            className="bg-gray-900 hover:bg-red-600 text-white px-5 py-2.5 transition-colors flex items-center gap-1.5"
          >
            Get a Quote <ArrowUpRight size={13} />
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="flex flex-col bg-gray-50 border-t border-gray-200">
          {NAV_LINKS.map(({ label, target }) => (
            <button
              key={target}
              onClick={() => goToSection(target)}
              className={`px-6 py-3.5 text-xs font-semibold tracking-widest uppercase border-b border-gray-200 text-left transition-colors ${
                isHome && active === target ? "text-red-600 bg-red-50" : "text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className={`px-6 py-3.5 text-xs font-semibold tracking-widest uppercase border-b border-gray-200 text-left transition-colors ${
              !isHome ? "text-red-600 bg-red-50" : "text-gray-600"
            }`}
          >
            Contact
          </Link>
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-red-600 text-left"
          >
            Get a Quote →
          </Link>
        </div>
      </div>
    </header>
  );
}