import { NextResponse } from "next/server";
import { getSessionUserId, callReviewsApi } from "../../../../lib/cartServer";

export const dynamic = "force-dynamic";

// DELETE /api/reviews/:id — requires login; backend also checks ownership.
export async function DELETE(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { ok, status, data } = await callReviewsApi(`/${params.id}`, { method: "DELETE", userId });
  return NextResponse.json(data, { status: ok ? 200 : status });
}
