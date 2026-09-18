// Next.js auto-serves this at /robots.txt — no separate route file needed.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",       // Next.js API routes — not pages, nothing to index
        "/admin",      // admin dashboard — private, and login-gated anyway
        "/account",    // personal account pages — private per-user data
        "/cart",       // no SEO value, and shows a signed-in user's cart
        "/checkout",   // same — a payment flow, not indexable content
        "/login",
        "/signup",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
