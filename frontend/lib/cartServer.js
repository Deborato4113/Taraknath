import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

// Confirms there's a logged-in user for this request and returns their id,
// or null if there isn't one (caller should respond 401).
export async function getSessionUserId() {
  const session = await getServerSession(authOptions);
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

// Same pattern, for /api/wishlist. DELETE takes the productId in the path
// (matching the backend route), GET/DELETE need userId as a query param.
export async function callWishlistApi(path, { method = "GET", userId, body } = {}) {
  const url = new URL(`${API_URL}/api/wishlist${path}`);
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

// Same pattern, for /api/quotes.
export async function callQuotesApi(path, { method = "GET", userId, body } = {}) {
  const url = new URL(`${API_URL}/api/quotes${path}`);
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

// Same pattern, for /api/coupons. No userId involved — coupon validation
// isn't tied to a particular user, just to the cart subtotal at checkout.
export async function callCouponsApi(path, { method = "POST", body } = {}) {
  const res = await fetch(`${API_URL}/api/coupons${path}`, {
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

// Same pattern, for /api/reviews. GET is public (no userId needed — a
// product's reviews are visible to anyone); POST/DELETE need userId, same
// as everywhere else here.
export async function callReviewsApi(path, { method = "GET", userId, body, query } = {}) {
  const url = new URL(`${API_URL}/api/reviews${path}`);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  if (method === "DELETE" && userId) url.searchParams.set("userId", userId);

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SECRET,
    },
    body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify({ ...body, userId }),
    cache: "no-store",
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// Same pattern, for the public /api/products endpoint on the backend —
// used by the cart page's "Frequently bought together" section, which
// needs same-category recommendations client-side. No secret required on
// the backend for this route (it's public catalog data), but we still
// proxy through here so the frontend never hardcodes the backend's URL.
export async function fetchRelatedProducts({ category, exclude = [], limit = 4 }) {
  const url = new URL(`${API_URL}/api/products/related`);
  url.searchParams.set("category", category);
  if (exclude.length) url.searchParams.set("exclude", exclude.join(","));
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}
