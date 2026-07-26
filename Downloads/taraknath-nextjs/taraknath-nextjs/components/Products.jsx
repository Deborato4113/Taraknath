"use client";

import Link from "next/link";
import { Anchor, Cog, CircleGauge, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Eyebrow, Reveal } from "./Atoms";

const CATEGORY_META = [
  {
    key: "shipyard",
    code: "01",
    Icon: Anchor,
    name: "Shipyard Products",
    blurb: "Life raft cradles, lockers, GI stowage boxes, brows and stanchions built to GRSE project specification.",
    tag: "YD: ASW-SWC 3033–3036",
  },
  {
    key: "deck",
    code: "02",
    Icon: Cog,
    name: "Deck Machinery",
    blurb: "Anchor capstans, windlasses, hydrographic davits and winches engineered for naval deployment.",
    tag: "YD: SVL 3025–3028",
  },
  {
    key: "bronze",
    code: "03",
    Icon: CircleGauge,
    name: "Bronze Items",
    blurb: "Volute casings, impellers, bushes, strainers and flanges cast to customer-specific tolerances.",
    tag: "Copper-Base Non-Ferrous",
  },
  {
    key: "bearing",
    code: "04",
    Icon: ShieldCheck,
    name: "White Metal Lining",
    blurb: "Journal bearings lined, bonded and ultrasonically verified in-house — manufacture, repair and round-the-clock service.",
    tag: "ASNT Level 2 Verified",
  },
];

export default function Products() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <Reveal>
            <Eyebrow>What We Build</Eyebrow>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase">
              Our Product Categories
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-gray-500 text-sm max-w-sm">
              Four core lines of manufacture, each built to project-grade specification.
              Click a category to explore all items.
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
          {CATEGORY_META.map(({ key, Icon, code, name, blurb, tag }, idx) => (
            <Reveal key={key} delay={idx * 80}>
              <div className="h-full bg-white hover:bg-gray-50 transition-colors p-7 sm:p-8 group flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-red-600 group-hover:bg-blue-800 transition-colors flex items-center justify-center flex-shrink-0">
                    <Icon className="text-white" size={20} />
                  </div>
                  <span className="mono text-2xl font-bold text-gray-200 group-hover:text-gray-300 transition-colors">
                    {code}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-3 heading-font uppercase">
                  {name}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1">{blurb}</p>
                <p className="mono text-[10px] text-blue-800 tracking-wide uppercase mb-5">{tag}</p>
                <Link
                  href={`/products/${key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase px-4 py-2.5 bg-gray-900 text-white hover:bg-red-600 transition-colors"
                >
                  View More <ArrowUpRight size={12} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
