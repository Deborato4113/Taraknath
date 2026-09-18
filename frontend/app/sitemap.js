// Next.js auto-serves whatever this returns at /sitemap.xml — no separate
// route file needed. Runs at request time (not build time), so it always
// reflects whatever products/categories currently exist in the database.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function sitemap() {
  const staticPages = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Category pages — same fixed list the rest of the site uses.
  const categorySlugs = ["shipyard", "deck", "bronze", "bearing", "babbit", "fabrication"];
  const categoryPages = categorySlugs.map((slug) => ({
    url: `${SITE_URL}/products/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Product pages — pulled live from the API so new products show up here
  // automatically without a code change. Excludes "bearing", which is a
  // services page rather than individually-slugged products.
  let productPages = [];
  try {
    const res = await fetch(`${API_URL}/api/products`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const products = await res.json();
      productPages = products
        .filter((p) => p.category?.slug && p.category.slug !== "bearing")
        .map((p) => ({
          url: `${SITE_URL}/products/${p.category.slug}/${p.slug}`,
          lastModified: p.updatedAt,
          changeFrequency: "monthly",
          priority: 0.6,
        }));
    }
  } catch {
    // If the backend is unreachable when the sitemap is generated, still
    // serve the static + category pages rather than a 500.
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
