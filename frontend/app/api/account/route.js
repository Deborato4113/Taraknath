import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const url = new URL(`${API_URL}/api/auth/me`);
  url.searchParams.set("userId", session.user.id);

  const res = await fetch(url.toString(), {
    headers: { "x-internal-secret": INTERNAL_SECRET },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await request.json();

  const res = await fetch(`${API_URL}/api/auth/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-internal-secret": INTERNAL_SECRET },
    body: JSON.stringify({ ...body, userId: session.user.id }),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
