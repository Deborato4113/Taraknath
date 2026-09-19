"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, ShoppingCart, ShieldCheck, ChevronDown, ListOrdered, MapPin, Heart } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "./CartContext";

const NAV_LINKS = [
  { label: "Home", target: "home" },
  { label: "About", target: "about" },
  { label: "Products", target: "products" },
  { label: "Services", target: "services" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const { data: session, status } = useSession();
  const { itemCount } = useCart();
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the account dropdown on an outside click, so it behaves like a
  // normal menu instead of staying open until something inside it is clicked.
  useEffect(() => {
    if (!accountMenuOpen) return;
    const onClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [accountMenuOpen]);

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
            <Image src="/logo.png" alt="Taraknath Engineering Works logo" fill sizes="40px" className="object-contain" />
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

          {/* Cart */}
          <Link href="/cart" className="relative text-gray-600 hover:text-red-600 transition-colors">
            <ShoppingCart size={19} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {/* Admin — only rendered for role === "ADMIN", never for regular customers */}
          {session?.user?.role === "ADMIN" && (
            <Link href="/admin" className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors">
              <ShieldCheck size={15} /> Admin
            </Link>
          )}

          {/* Account — login link, or a dropdown with Account/Orders/Log out
              for signed-in users. Clicking the name never logs out directly
              — it opens this menu first. */}
          {status === "authenticated" ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors"
                title={session.user?.email}
              >
                <User size={15} /> {session.user?.name?.split(" ")[0] || "Account"}
                <ChevronDown size={13} className={`transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-gray-200 shadow-lg py-1 normal-case tracking-normal font-normal text-sm">
                  <Link
                    href="/account"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  >
                    <User size={15} /> Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  >
                    <ListOrdered size={15} /> Orders
                  </Link>
                  <Link
                    href="/account/addresses"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  >
                    <MapPin size={15} /> Addresses
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600"
                  >
                    <Heart size={15} /> Wishlist
                  </Link>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setAccountMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-red-600 text-left"
                  >
                    <X size={15} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`} className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors">
              <User size={15} /> Login
            </Link>
          )}
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
        className={`lg:hidden overflow-y-auto transition-all duration-300 ${
          menuOpen ? "max-h-[calc(100vh-5rem)]" : "max-h-0"
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
            href="/cart"
            onClick={() => setMenuOpen(false)}
            className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-gray-600 text-left border-t border-gray-200 flex items-center justify-between"
          >
            Cart {itemCount > 0 && <span className="text-red-600">({itemCount})</span>}
          </Link>

          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-gray-600 text-left border-t border-gray-200 flex items-center gap-1.5"
            >
              <ShieldCheck size={14} /> Admin
            </Link>
          )}

          {status === "authenticated" && (
            <>
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-gray-600 text-left border-t border-gray-200"
              >
                Account
              </Link>
              <Link
                href="/account/orders"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-gray-600 text-left border-t border-gray-200"
              >
                Orders
              </Link>
              <Link
                href="/account/addresses"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-gray-600 text-left border-t border-gray-200"
              >
                Addresses
              </Link>
              <Link
                href="/account/wishlist"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-gray-600 text-left border-t border-gray-200"
              >
                Wishlist
              </Link>
            </>
          )}

          {status === "authenticated" ? (
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-gray-600 text-left border-t border-gray-200"
            >
              Log Out ({session.user?.name?.split(" ")[0] || "Account"})
            </button>
          ) : (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
              onClick={() => setMenuOpen(false)}
              className="px-6 py-3.5 text-xs font-semibold tracking-widest uppercase text-gray-600 text-left border-t border-gray-200"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}