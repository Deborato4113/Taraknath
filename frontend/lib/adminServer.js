import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

// Confirms there's a logged-in user AND that they're an admin. Returns the
// session if so, or null otherwise — every /api/admin/* route and every
// page under /admin should refuse to do anything if this comes back null.
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return null;
  return session;
}

// Same forwarding pattern as callCartApi/callOrdersApi in cartServer.js —
// the backend trusts this because only this Next.js server holds
// INTERNAL_API_SECRET, and we've already checked role === "ADMIN" above
// before ever calling this.
export async function callAdminApi(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SECRET,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
