import ProductDetailPage from "../../../../components/ProductDetailPage";
import { SHIPYARD_ITEMS, DECK_MACHINERY_ITEMS, BRONZE_ITEMS, BEARING_SERVICES } from "../../../../lib/data";
import { notFound } from "next/navigation";

const CATEGORY_ITEMS = {
  shipyard: { items: SHIPYARD_ITEMS, name: "Shipyard Products" },
  deck:     { items: DECK_MACHINERY_ITEMS, name: "Deck Machinery" },
  bronze:   { items: BRONZE_ITEMS, name: "Bronze Items" },
  bearing:  { items: BEARING_SERVICES, name: "White Metal Lining" },
};

export function generateStaticParams() {
  return Object.entries(CATEGORY_ITEMS).flatMap(([category, { items }]) =>
    items.map((_, i) => ({ category, productId: String(i) }))
  );
}

export function generateMetadata({ params }) {
  const cat = CATEGORY_ITEMS[params.category];
  if (!cat) return {};
  const item = cat.items[parseInt(params.productId)];
  if (!item) return {};
  return {
    title: `${item.name} — Taraknath Engineering Works`,
    description: item.desc,
  };
}

export default function Page({ params }) {
  const cat = CATEGORY_ITEMS[params.category];
  if (!cat) notFound();
  const item = cat.items[parseInt(params.productId)];
  if (!item) notFound();

  return (
    <ProductDetailPage
      item={item}
      category={params.category}
      categoryName={cat.name}
      productId={parseInt(params.productId)}
      allItems={cat.items}
    />
  );
}
