import { NextResponse } from "next/server";
import { getSessionUserId, callCartApi } from "../../../lib/cartServer";

// Without this, Next.js can cache this route's response (including a
// stale 401 from before you were logged in) instead of re-checking the
// session on every request.
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { ok, status, data } = await callCartApi("", { method: "GET", userId });
  return NextResponse.json(data, { status: ok ? 200 : status });
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await request.json();
  const { ok, status, data } = await callCartApi("", { method: "POST", userId, body });
  return NextResponse.json(data, { status: ok ? 201 : status });
}
