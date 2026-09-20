import { NextResponse } from "next/server";
import { getSessionUserId, callCouponsApi } from "../../../../lib/cartServer";

export const dynamic = "force-dynamic";

// POST /api/coupons/validate — { code, subtotal }
// Requires login (same as checkout itself) so this can't be hammered
// anonymously to brute-force valid coupon codes.
export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await request.json();
  const { ok, status, data } = await callCouponsApi("/validate", { method: "POST", body });
  return NextResponse.json(data, { status: ok ? 200 : status });
}
