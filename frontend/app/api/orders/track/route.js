import { NextResponse } from "next/server";
import { callOrdersApi } from "../../../../lib/cartServer";

export const dynamic = "force-dynamic";

// POST /api/orders/track — { orderId, contact } — deliberately does NOT
// check for a logged-in session (unlike every other /api/orders/* route
// here). Guest order tracking is the whole point: someone who checked out
// without wanting an account, or just doesn't want to log back in, can
// still see their order status by proving they know the order ID and the
// email/phone on it.
export async function POST(request) {
  const body = await request.json();
  const { ok, status, data } = await callOrdersApi("/track", { method: "POST", body });
  return NextResponse.json(data, { status: ok ? 200 : status });
}
