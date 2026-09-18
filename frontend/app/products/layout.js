export const metadata = {
  title: "Search All Products",
  description:
    "Search and filter Taraknath Engineering Works' full product catalogue by category, price and availability — shipyard products, deck machinery, bronze items, bearings and more.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Search All Products — Taraknath Engineering Works",
    description:
      "Search and filter our full product catalogue by category, price and availability.",
    url: "/products",
    type: "website",
  },
};

export default function ProductsLayout({ children }) {
  return children;
}
