import CategoryPageClient from "../../../components/CategoryPageClient";
import { BEARING_SERVICES } from "../../../lib/data";
import { getCategory } from "../../../lib/api";
import { notFound } from "next/navigation";

// The "bearing" category is a set of services (Manufacturing/Repair/Service),
// not individually-photographed products — it stays as static content rather
// than DB-backed products. Every other category now comes from the database.
const CATEGORY_NAMES = {
  shipyard: "Shipyard Products",
  deck: "Deck Machinery",
  bronze: "Bronze Items",
  bearing: "White Metal Lining Bearing and Thrust Pads",
  babbit: "Babbit Lining Bearing and Thrust Pads",
  fabrication: "Fabrication and Machining",
};

export async function generateStaticParams() {
  return Object.keys(CATEGORY_NAMES).map((key) => ({ category: key }));
}

export async function generateMetadata({ params }) {
  const name = CATEGORY_NAMES[params.category];
  if (!name) return {};

  const title = name;
  const description = `Browse all ${name} manufactured by Taraknath Engineering Works, ISO 9001:2015 certified.`;
  const url = `/products/${params.category}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function CategoryPage({ params }) {
  const { category } = params;
  if (!CATEGORY_NAMES[category]) notFound();

  if (category === "bearing") {
    const meta = {
      name: CATEGORY_NAMES.bearing,
      tag: "ASNT Level 2 Verified",
      items: BEARING_SERVICES,
      kind: "bearing",
    };
    return <CategoryPageClient category={category} meta={meta} />;
  }

  const data = await getCategory(category);
  if (!data) notFound();

  const meta = {
    name: data.name,
    tag: data.tag,
    items: data.items,
    kind: "items",
  };

  return <CategoryPageClient category={category} meta={meta} />;
}
