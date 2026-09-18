import { NextResponse } from "next/server";
import { getSessionUserId, callCartApi } from "../../../../lib/cartServer";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await request.json();
  const { ok, status, data } = await callCartApi(`/${params.itemId}`, {
    method: "PATCH",
    userId,
    body,
  });
  return NextResponse.json(data, { status: ok ? 200 : status });
}

export async function DELETE(request, { params }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { ok, status, data } = await callCartApi(`/${params.itemId}`, {
    method: "DELETE",
    userId,
  });
  return NextResponse.json(data, { status: ok ? 200 : status });
}
