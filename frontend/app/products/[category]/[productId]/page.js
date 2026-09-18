import ProductDetailPage from "../../../../components/ProductDetailPage";
import { BEARING_SERVICES } from "../../../../lib/data";
import { getCategory, getProductBySlug } from "../../../../lib/api";
import { notFound } from "next/navigation";

const CATEGORY_NAMES = {
  shipyard: "Shipyard Products",
  deck: "Deck Machinery",
  bronze: "Bronze Items",
  bearing: "White Metal Lining Bearing and Thrust Pads",
  babbit: "Babbit Lining Bearing and Thrust Pads",
  fabrication: "Fabrication and Machining",
};

// NOTE: [productId] is a historical name for this route segment — it's
// actually a product *slug* now (e.g. "lockers", "anchor-capstan"), not a
// numeric index. Renaming the folder to [productSlug] would be cleaner but
// isn't required — Next.js just passes whatever the folder is named as the
// param key, so we keep reading params.productId here to avoid a rename.

export async function generateStaticParams() {
  // Only pre-building the DB-backed categories here; the "bearing" category
  // is a services page, not individual product detail pages.
  const categories = Object.keys(CATEGORY_NAMES).filter((c) => c !== "bearing");
  const params = [];
  for (const category of categories) {
    const data = await getCategory(category);
    if (!data) continue;
    for (const item of data.items) {
      params.push({ category, productId: item.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  if (params.category === "bearing") return {};
  const product = await getProductBySlug(params.productId);
  if (!product) return {};

  const title = product.name;
  const description = product.desc;
  const url = `/products/${params.category}/${params.productId}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: product.images?.length ? product.images : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images?.length ? product.images : undefined,
    },
  };
}

export default async function Page({ params }) {
  const { category, productId: slug } = params;
  if (!CATEGORY_NAMES[category] || category === "bearing") notFound();

  const [product, categoryData] = await Promise.all([
    getProductBySlug(slug),
    getCategory(category),
  ]);

  if (!product || !categoryData) notFound();

  // Compute prev/next within this category's product list for the
  // Previous/Next navigation buttons at the bottom of the page.
  const items = categoryData.items;
  const currentIndex = items.findIndex((p) => p.slug === slug);
  const prevSlug = currentIndex > 0 ? items[currentIndex - 1].slug : null;
  const nextSlug = currentIndex < items.length - 1 ? items[currentIndex + 1].slug : null;

  return (
    <ProductDetailPage
      item={product}
      category={category}
      categoryName={CATEGORY_NAMES[category]}
      prevSlug={prevSlug}
      nextSlug={nextSlug}
    />
  );
}
