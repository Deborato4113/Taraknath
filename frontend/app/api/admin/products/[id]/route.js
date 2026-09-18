import { NextResponse } from "next/server";
import { requireAdminSession, callAdminApi } from "../../../../../lib/adminServer";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { ok, status, data } = await callAdminApi(`/products/${params.id}`);
  return NextResponse.json(data, { status: ok ? 200 : status });
}

export async function PUT(request, { params }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { ok, status, data } = await callAdminApi(`/products/${params.id}`, { method: "PUT", body });
  return NextResponse.json(data, { status: ok ? 200 : status });
}

export async function DELETE(request, { params }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { ok, status, data } = await callAdminApi(`/products/${params.id}`, { method: "DELETE" });
  return NextResponse.json(data, { status: ok ? 200 : status });
}
