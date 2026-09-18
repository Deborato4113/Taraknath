import { NextResponse } from "next/server";
import { getSessionUserId } from "../../../lib/cartServer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const url = new URL(`${API_URL}/api/addresses`);
  url.searchParams.set("userId", userId);

  const res = await fetch(url.toString(), {
    headers: { "x-internal-secret": INTERNAL_SECRET },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await request.json();

  const res = await fetch(`${API_URL}/api/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-internal-secret": INTERNAL_SECRET },
    body: JSON.stringify({ ...body, userId }),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
