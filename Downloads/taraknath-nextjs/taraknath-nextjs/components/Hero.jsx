"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "./Atoms";

function useCountUp(target, active, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return value;
}

export default function Hero({ onExplore }) {
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isoYear = useCountUp(2015, statsVisible);

  return (
    <section className="relative bg-gray-900 text-white overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute -right-24 -top-24 w-[480px] h-[480px] rounded-full opacity-[0.08] pointer-events-none"
        style={{ background: "radial-gradient(circle, #C8102E 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Floating engineering mark */}
      <div className="absolute right-8 sm:right-14 top-10 hidden md:block opacity-30 animate-float-slow" aria-hidden="true">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="58" stroke="#C8102E" strokeWidth="1" />
          <circle cx="60" cy="60" r="40" stroke="#C8102E" strokeWidth="1" />
          <line x1="60" y1="2" x2="60" y2="18" stroke="#C8102E" strokeWidth="1" />
          <line x1="60" y1="102" x2="60" y2="118" stroke="#C8102E" strokeWidth="1" />
          <line x1="2" y1="60" x2="18" y2="60" stroke="#C8102E" strokeWidth="1" />
          <line x1="102" y1="60" x2="118" y2="60" stroke="#C8102E" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 lg:py-36">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot" />
          <Eyebrow className="!mb-0 text-red-500">
            Kolkata, West Bengal · Decades of Shipyard Engineering
          </Eyebrow>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] max-w-3xl heading-font uppercase">
          Precision Components for India's Naval Shipyards
        </h1>

        <p className="mt-6 max-w-xl text-gray-300 text-sm sm:text-base leading-relaxed">
          From GRSE deck machinery to white-metal bearing repair, Taraknath
          Engineering Works manufactures the fittings that keep naval and
          industrial fleets in service.
        </p>

        <div className="mt-9 flex flex-wrap gap-4">
          <button
            onClick={onExplore}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 hover:scale-[1.03] transition-all text-white text-xs font-semibold tracking-[0.2em] uppercase px-7 py-4"
          >
            See What We Do <ArrowRight size={15} />
          </button>
          <a
            href="/PDF_catalogue/TEW_CATALOGUE.pdf"
            download="TEW_CATALOGUE.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-gray-600 hover:border-white hover:scale-[1.03] transition-all text-white text-xs font-semibold tracking-[0.2em] uppercase px-7 py-4"
          > 
  Get Catalogue
</a>
        </div>

        {/* Stats bar */}
        <div
          ref={statsRef}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl border-t border-gray-700 pt-8"
        >
          {[
            [`ISO ${isoYear}`, "Certified Works"],
            ["ASNT Level 2", "Qualified Operators"],
            ["100%", "Ultrasonic Verified"],
            ["24/7", "Breakdown Service"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="text-lg sm:text-xl font-bold heading-font text-white">{stat}</p>
              <p className="text-[11px] text-gray-400 mono tracking-wide mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
