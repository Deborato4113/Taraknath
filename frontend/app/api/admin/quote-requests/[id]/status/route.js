import { NextResponse } from "next/server";
import { requireAdminSession, callAdminApi } from "../../../../../../lib/adminServer";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { ok, status, data } = await callAdminApi(`/quote-requests/${params.id}/status`, { method: "PUT", body });
  return NextResponse.json(data, { status: ok ? 200 : status });
}
