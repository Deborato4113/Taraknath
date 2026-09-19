import { NextResponse } from "next/server";
import { getSessionUserId, callWishlistApi } from "../../../../lib/cartServer";

export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { ok, status, data } = await callWishlistApi(`/${params.productId}`, { method: "DELETE", userId });
  return NextResponse.json(data, { status: ok ? 200 : status });
}
