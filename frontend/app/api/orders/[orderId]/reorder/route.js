import { NextResponse } from "next/server";
import { getSessionUserId, callOrdersApi } from "../../../../../lib/cartServer";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { ok, status, data } = await callOrdersApi(`/${params.orderId}/reorder`, { method: "POST", userId });
  return NextResponse.json(data, { status: ok ? 200 : status });
}
