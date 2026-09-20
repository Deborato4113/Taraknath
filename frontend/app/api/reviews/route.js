import { NextResponse } from "next/server";
import { getSessionUserId, callReviewsApi } from "../../../lib/cartServer";

export const dynamic = "force-dynamic";

// GET /api/reviews?productId=xxx — public, no login required.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId is required" }, { status: 400 });

  const { ok, status, data } = await callReviewsApi("", { method: "GET", query: { productId } });
  return NextResponse.json(data, { status: ok ? 200 : status });
}

// POST /api/reviews — { productId, rating, comment } — requires login.
export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await request.json();
  const { ok, status, data } = await callReviewsApi("", { method: "POST", userId, body });
  return NextResponse.json(data, { status: ok ? 201 : status });
}
