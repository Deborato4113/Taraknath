import { NextResponse } from "next/server";
import { requireAdminSession, callAdminApi } from "../../../../lib/adminServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { ok, status, data } = await callAdminApi("/orders");
  return NextResponse.json(data, { status: ok ? 200 : status });
}
