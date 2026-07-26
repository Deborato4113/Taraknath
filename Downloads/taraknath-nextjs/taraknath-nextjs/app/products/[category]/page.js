import CategoryPageClient from "../../../components/CategoryPageClient";
import { SHIPYARD_ITEMS, DECK_MACHINERY_ITEMS, BRONZE_ITEMS, BEARING_SERVICES } from "../../../lib/data";
import { notFound } from "next/navigation";

const CATEGORIES = {
  shipyard: { name: "Shipyard Products", tag: "YD: ASW-SWC 3033-3036", items: SHIPYARD_ITEMS, kind: "items" },
  deck:     { name: "Deck Machinery", tag: "YD: SVL 3025-3028", items: DECK_MACHINERY_ITEMS, kind: "items" },
  bronze:   { name: "Bronze Items", tag: "Copper-Base Non-Ferrous", items: BRONZE_ITEMS, kind: "items" },
  bearing:  { name: "White Metal Lining Journal Bearing", tag: "ASNT Level 2 Verified", items: BEARING_SERVICES, kind: "bearing" },
};

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((key) => ({ category: key }));
}

export function generateMetadata({ params }) {
  const cat = CATEGORIES[params.category];
  if (!cat) return {};
  return {
    title: `${cat.name} — Taraknath Engineering Works`,
    description: `Browse all ${cat.name} manufactured by Taraknath Engineering Works, ISO 9001:2015 certified.`,
  };
}

export default function CategoryPage({ params }) {
  const cat = CATEGORIES[params.category];
  if (!cat) notFound();
  return <CategoryPageClient category={params.category} meta={cat} />;
}