"use client";

import { useRef, useState, useEffect } from "react";

export function Divider() {
  return <div className="h-1 w-full bg-blue-800" aria-hidden="true" />;
}

export function Eyebrow({ children, className = "" }) {
  return (
    <p className={`mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-3 ${className}`}>
      {children}
    </p>
  );
}

export function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export function Reveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
