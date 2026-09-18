import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

// Confirms there's a logged-in user for this request and returns their id,
// or null if there isn't one (caller should respond 401).
export async function getSessionUserId() {
  const session = await getServerSession(authOptions);

  console.log(
    "SERVER CART SESSION:",
    JSON.stringify(session, null, 2)
  );

  return session?.user?.id ?? null;
}

// Calls the backend's /api/cart routes with the internal secret + userId
// attached, so the backend can trust this request came from a
// session Next.js already verified.
export async function callCartApi(path, { method = "GET", userId, body } = {}) {
  const url = new URL(`${API_URL}/api/cart${path}`);
  const isGetOrDelete = method === "GET" || method === "DELETE";

  if (isGetOrDelete) url.searchParams.set("userId", userId);

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SECRET,
    },
    body: isGetOrDelete ? undefined : JSON.stringify({ ...body, userId }),
    cache: "no-store",
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// Same pattern as callCartApi, for /api/orders. GET is the only method that
// needs userId as a query param — create/verify send it in the body.
export async function callOrdersApi(path, { method = "GET", userId, body } = {}) {
  const url = new URL(`${API_URL}/api/orders${path}`);
  if (method === "GET") url.searchParams.set("userId", userId);

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SECRET,
    },
    body: method === "GET" ? undefined : JSON.stringify({ ...body, userId }),
    cache: "no-store",
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
