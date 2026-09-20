import { NextResponse } from "next/server";
import { requireAdminSession, callAdminApi } from "../../../../lib/adminServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { ok, status, data } = await callAdminApi("/coupons");
  return NextResponse.json(data, { status: ok ? 200 : status });
}

export async function POST(request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { ok, status, data } = await callAdminApi("/coupons", { method: "POST", body });
  return NextResponse.json(data, { status: ok ? 201 : status });
}
