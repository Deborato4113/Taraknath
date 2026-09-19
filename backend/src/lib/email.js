// Transactional email — order confirmations, order status updates, and
// low-stock alerts to the shop owner. Uses the same Resend account as the
// contact form (frontend/app/api/contact/route.js), just from the backend
// this time, since that's where orders and stock actually change.
//
// SETUP: add your Resend API key to backend/.env:
//   RESEND_API_KEY="re_xxxxxxxx"
// (the same key from your Resend dashboard — one account, used from both
// the frontend contact form and this backend).
//
// IMPORTANT LIMITATION — same one as the contact form hit earlier: until
// you verify your own domain in the Resend dashboard, Resend only lets you
// send FROM their shared address (onboarding@resend.dev) and only TO the
// email address you signed up to Resend with. That means order-confirmation
// and status-update emails — which need to go to arbitrary customer email
// addresses — will silently fail for any address that isn't your own
// Resend signup email, until you verify a domain. Low-stock alerts (sent to
// you, the owner) aren't affected by this.
// Fix: verify a domain in the Resend dashboard (free), then change
// FROM_EMAIL below to an address on that domain.

const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = "Taraknath Engineering Works <onboarding@resend.dev>";

// Who low-stock alerts go to — comma-separate multiple addresses if you
// want more than one person to get them (e.g. "you@x.com,partner@y.com").
// Defaults to the same inbox the contact form delivers enquiries to, so
// nothing new to configure if you don't want it.
const OWNER_EMAILS = (process.env.OWNER_ALERT_EMAIL || "deboratochaudhury2023@gmail.com")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

// Stock at or below this triggers a low-stock alert email.
const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 5);

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function money(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function itemsTable(items) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(item.product?.name || "Item")} × ${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${money(Number(item.price) * item.quantity)}</td>
        </tr>`
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}</table>`;
}

// Every send*Email function below fails soft: logs and returns rather than
// throwing, because a failed email should never break the order/status
// update it's attached to.
async function send({ to, subject, html }) {
  if (!resend) {
    console.error(`Email not sent (RESEND_API_KEY missing): "${subject}" to ${to}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    if (error) console.error("Resend error:", error);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

async function sendOrderConfirmationEmail({ order, user }) {
  if (!user?.email) return;

  await send({
    to: user.email,
    subject: `Order Confirmed — #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <h2>Thanks for your order, ${escapeHtml(user.name || "there")}!</h2>
      <p>Your payment has been received and your order is confirmed.</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      ${itemsTable(order.items)}
      <p style="margin-top:16px;font-size:16px;"><strong>Total Paid: ${money(order.total)}</strong></p>
      <p style="margin-top:24px;color:#666;font-size:13px;">
        We'll email you again once your order ships. You can also check its status any time
        under "My Orders" on the website.
      </p>
    `,
  });
}

async function sendOrderStatusEmail({ order, user, status }) {
  if (!user?.email) return;

  const STATUS_MESSAGES = {
    PROCESSING: "Your order is now being processed.",
    SHIPPED: "Your order has shipped!",
    DELIVERED: "Your order has been delivered.",
    CANCELLED: "Your order has been cancelled.",
  };
  const message = STATUS_MESSAGES[status];
  if (!message) return; // don't email for PENDING/PAID — those are covered by the confirmation email

  await send({
    to: user.email,
    subject: `Order Update — #${order.id.slice(-8).toUpperCase()} is now ${status}`,
    html: `
      <h2>${message}</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p style="margin-top:24px;color:#666;font-size:13px;">
        You can view full order details any time under "My Orders" on the website.
      </p>
    `,
  });
}

async function sendLowStockAlert({ product }) {
  await send({
    to: OWNER_EMAILS,
    subject: `Low Stock Alert — ${product.name} (${product.stock} left)`,
    html: `
      <h2>Low stock warning</h2>
      <p><strong>${escapeHtml(product.name)}</strong> (SKU: ${escapeHtml(product.sku)}) is down to
      <strong>${product.stock}</strong> unit(s) — at or below your threshold of ${LOW_STOCK_THRESHOLD}.</p>
      <p>Update stock or restock soon from the admin dashboard.</p>
    `,
  });
}

async function sendQuoteRequestEmail({ quoteRequest, user }) {
  const rows = quoteRequest.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            ${escapeHtml(item.product?.name || "Item")} (SKU: ${escapeHtml(item.product?.sku || "—")})
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(item.note || "")}</td>
        </tr>`
    )
    .join("");

  await send({
    to: OWNER_EMAILS,
    subject: `New Bulk Quote Request — ${escapeHtml(user.name || user.email)}`,
    html: `
      <h2>New bulk quote request from the website</h2>
      <p><strong>From:</strong> ${escapeHtml(user.name || "")} (${escapeHtml(user.email)})</p>
      ${quoteRequest.projectRef ? `<p><strong>Project / PO reference:</strong> ${escapeHtml(quoteRequest.projectRef)}</p>` : ""}
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
        <tr style="font-weight:bold;">
          <td style="padding:8px 0;border-bottom:2px solid #333;">Item</td>
          <td style="padding:8px 0;border-bottom:2px solid #333;text-align:right;">Qty</td>
          <td style="padding:8px 0;border-bottom:2px solid #333;">Note</td>
        </tr>
        ${rows}
      </table>
      ${quoteRequest.message ? `<p style="margin-top:16px;"><strong>Message:</strong><br>${escapeHtml(quoteRequest.message).replace(/\n/g, "<br>")}</p>` : ""}
      <p style="margin-top:24px;color:#666;font-size:13px;">Quote request ID: ${quoteRequest.id}</p>
    `,
  });
}

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendLowStockAlert,
  sendQuoteRequestEmail,
  LOW_STOCK_THRESHOLD,
};
