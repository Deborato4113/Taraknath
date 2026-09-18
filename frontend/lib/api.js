// Thin wrapper around the backend API. All product/category data now lives
// in the database (see /backend) — this is the only place the frontend
// talks to it, and it also adapts the API's shape back to the
// {name, tag, desc, image, images, slug} shape the existing UI components
// were built around, so components didn't need to change.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function adaptProduct(p) {
  const urls = (p.images || []).map((img) => img.url);
  return {
    id: p.id, // needed for cart operations — Add to Cart posts this, not the slug
    slug: p.slug,
    name: p.name,
    tag: p.tag,
    desc: p.description,
    image: urls[0] ?? null,
    images: urls,
    price: p.price,
    isBuyable: p.isBuyable,
  };
}

// Fetches one category (by slug) with its products, adapted to the shape
// CategoryPageClient/ProductDetailPage already expect.
// Returns null if the category doesn't exist (caller should notFound()).
export async function getCategory(slug) {
  const res = await fetch(`${API_URL}/api/categories/${slug}`, {
    // Revalidate periodically instead of caching forever, since an admin
    // panel will be able to change products later.
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch category "${slug}": ${res.status}`);

  const data = await res.json();
  return {
    slug: data.slug,
    name: data.name,
    tag: data.tag,
    blurb: data.blurb,
    items: (data.products || []).map(adaptProduct),
  };
}

// Fetches every category slug — used by generateStaticParams.
export async function getAllCategorySlugs() {
  const res = await fetch(`${API_URL}/api/categories`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  const categories = await res.json();
  return categories.map((c) => c.slug);
}

// Fetches a single product by slug, adapted to the {name, tag, desc, image,
// images} shape ProductDetailPage expects.
export async function getProductBySlug(slug) {
  const res = await fetch(`${API_URL}/api/products/${slug}`, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch product "${slug}": ${res.status}`);
  const data = await res.json();
  return adaptProduct(data);
}
