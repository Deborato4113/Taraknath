import { NextResponse } from "next/server";
import { fetchRelatedProducts } from "../../../../lib/cartServer";
import { adaptProduct } from "../../../../lib/api";

export const dynamic = "force-dynamic";

// GET /api/products/related?category=deck,shipyard&exclude=id1,id2&limit=4
// Public — no login required, this is just catalog data (same as browsing
// a category page). Used by the cart page's "Frequently bought together".
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  if (!category) return NextResponse.json([]);

  const exclude = (searchParams.get("exclude") || "").split(",").filter(Boolean);
  const limit = Number(searchParams.get("limit")) || 4;

  const products = await fetchRelatedProducts({ category, exclude, limit });
  return NextResponse.json(products.map(adaptProduct));
}
