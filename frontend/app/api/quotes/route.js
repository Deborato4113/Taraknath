import { NextResponse } from "next/server";
import { getSessionUserId, callQuotesApi } from "../../../lib/cartServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { ok, status, data } = await callQuotesApi("", { method: "GET", userId });
  return NextResponse.json(data, { status: ok ? 200 : status });
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await request.json();
  const { ok, status, data } = await callQuotesApi("", { method: "POST", userId, body });
  return NextResponse.json(data, { status: ok ? 201 : status });
}
