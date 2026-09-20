const express = require("express");
const { prisma } = require("../lib/prisma");
const { sendOrderStatusEmail } = require("../lib/email");

const router = express.Router();

// Same trust model as cart.js/orders.js: this API is only ever called by
// the Next.js server, which has already checked (via NextAuth session)
// that the caller is logged in AND has role === "ADMIN" — see
// frontend/lib/adminServer.js. The secret proves the request really came
// from that trusted server, not directly from someone's browser.
function requireInternalSecret(req, res, next) {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(requireInternalSecret);

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [productCount, pendingOrders, allOrders, paidOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count(),
      prisma.order.findMany({ where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } } }),
    ]);

    const revenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

    res.json({
      productCount,
      orderCount: allOrders,
      pendingOrders,
      revenue,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─────────────────────────────────────────────
// PRODUCTS (admin sees unpublished ones too)
// ─────────────────────────────────────────────

// GET /api/admin/products
router.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { images: { orderBy: { position: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/admin/products/:id
router.get("/products/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: { orderBy: { position: "asc" } }, category: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /api/admin/products
// { sku, name, slug, tag, description, price, isBuyable, stock, isPublished,
//   categoryId, images: [{url, position}] }
router.post("/products", async (req, res) => {
  try {
    const {
      sku, name, slug, tag, description,
      price, isBuyable, stock, isPublished,
      categoryId, images,
    } = req.body;

    if (!sku || !name || !slug || !description || !categoryId) {
      return res.status(400).json({ error: "sku, name, slug, description and categoryId are required" });
    }

    const product = await prisma.product.create({
      data: {
        sku, name, slug, tag, description,
        price: price === "" || price == null ? null : price,
        isBuyable: !!isBuyable,
        stock: Number(stock) || 0,
        isPublished: isPublished !== false,
        categoryId,
        images: {
          create: (images || [])
            .filter((img) => img.url)
            .map((img, i) => ({ url: img.url, position: i })),
        },
      },
      include: { images: true, category: true },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002") {
      return res.status(409).json({ error: "SKU or slug already in use" });
    }
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/admin/products/:id — same body shape as POST
router.put("/products/:id", async (req, res) => {
  try {
    const {
      sku, name, slug, tag, description,
      price, isBuyable, stock, isPublished,
      categoryId, images,
    } = req.body;

    // Replace the image set wholesale rather than diffing — simplest
    // correct behaviour for an admin form that submits the full list
    // every time.
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        sku, name, slug, tag, description,
        price: price === "" || price == null ? null : price,
        isBuyable: !!isBuyable,
        stock: Number(stock) || 0,
        isPublished: isPublished !== false,
        categoryId,
        images: {
          deleteMany: {},
          create: (images || [])
            .filter((img) => img.url)
            .map((img, i) => ({ url: img.url, position: i })),
        },
      },
      include: { images: true, category: true },
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") return res.status(404).json({ error: "Product not found" });
    if (err.code === "P2002") return res.status(409).json({ error: "SKU or slug already in use" });
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/admin/products/:id
router.delete("/products/:id", async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") return res.status(404).json({ error: "Product not found" });
    // Most likely cause: this product is referenced by existing order_items
    // (onDelete is not Cascade for that relation, on purpose — deleting a
    // product should never silently corrupt order history).
    if (err.code === "P2003") {
      return res.status(409).json({
        error: "Can't delete a product that appears in existing orders. Unpublish it instead.",
      });
    }
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ─────────────────────────────────────────────
// CATEGORIES (read-only here — just for the product form's dropdown)
// ─────────────────────────────────────────────

// GET /api/admin/categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { code: "asc" } });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────

// PENDING, PAID and PROCESSING are all set automatically by the system
// (order creation and successful payment verification — see orders.js) and
// are deliberately NOT in this list: an admin should never be able to mark
// something "paid" by hand. This is only what the status dropdown may set.
const ADMIN_SETTABLE_STATUSES = ["SHIPPED", "DELIVERED", "CANCELLED"];
const ALL_STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

// GET /api/admin/orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        address: true,
        items: { include: { product: { select: { name: true, sku: true } } } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PUT /api/admin/orders/:id/status — { status }
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!ADMIN_SETTABLE_STATUSES.includes(status)) {
      if (ALL_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `${status} is set automatically by the payment system and can't be set manually. You can set: ${ADMIN_SETTABLE_STATUSES.join(", ")}.`,
        });
      }
      return res.status(400).json({ error: `status must be one of ${ADMIN_SETTABLE_STATUSES.join(", ")}` });
    }

    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Order not found" });

    // Can't ship or deliver something that was never actually paid for.
    if (
      (status === "SHIPPED" || status === "DELIVERED") &&
      !["PAID", "PROCESSING", "SHIPPED"].includes(existing.status)
    ) {
      return res.status(400).json({
        error: `Can't mark an order as ${status} while it's still ${existing.status} — payment hasn't been confirmed yet.`,
      });
    }
    // Once delivered, cancelling no longer makes sense — use a refund
    // process outside the order status instead.
    if (status === "CANCELLED" && existing.status === "DELIVERED") {
      return res.status(400).json({ error: "Can't cancel an order that's already been delivered." });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { user: true },
    });

    // Fire-and-forget, same as order confirmation — the status change has
    // already succeeded in the database by this point, so an email
    // provider hiccup shouldn't turn into a 500 for the admin.
    sendOrderStatusEmail({ order, user: order.user, status }).catch(() => {});

    // order.user includes the password hash (needed internally for the
    // email step above) — never let that leave this server.
    const { password, ...safeUser } = order.user;
    res.json({ ...order, user: safeUser });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") return res.status(404).json({ error: "Order not found" });
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// ─────────────────────────────────────────────
// BULK QUOTE REQUESTS (RFQs)
// ─────────────────────────────────────────────

const QUOTE_STATUSES = ["NEW", "CONTACTED", "CLOSED"];

// GET /api/admin/quote-requests
router.get("/quote-requests", async (req, res) => {
  try {
    const quotes = await prisma.quoteRequest.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(quotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quote requests" });
  }
});

// PUT /api/admin/quote-requests/:id/status — { status }
router.put("/quote-requests/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!QUOTE_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${QUOTE_STATUSES.join(", ")}` });
    }

    const quote = await prisma.quoteRequest.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(quote);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") return res.status(404).json({ error: "Quote request not found" });
    res.status(500).json({ error: "Failed to update quote request" });
  }
});

// ─────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────

// GET /api/admin/coupons
router.get("/coupons", async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json(coupons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

// POST /api/admin/coupons
// { code, type: "PERCENT"|"FLAT", value, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive }
router.post("/coupons", async (req, res) => {
  try {
    const { code, type, value, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive } = req.body;

    if (!code || !type || value == null) {
      return res.status(400).json({ error: "code, type and value are required" });
    }
    if (!["PERCENT", "FLAT"].includes(type)) {
      return res.status(400).json({ error: "type must be PERCENT or FLAT" });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minOrderValue: minOrderValue === "" || minOrderValue == null ? null : Number(minOrderValue),
        maxDiscount: maxDiscount === "" || maxDiscount == null ? null : Number(maxDiscount),
        usageLimit: usageLimit === "" || usageLimit == null ? null : Number(usageLimit),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== false,
      },
    });

    res.status(201).json(coupon);
  } catch (err) {
    console.error(err);
    if (err.code === "P2002") return res.status(409).json({ error: "That coupon code already exists" });
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

// PUT /api/admin/coupons/:id — same body shape as POST; also used just to
// toggle isActive on/off from the list view.
router.put("/coupons/:id", async (req, res) => {
  try {
    const { code, type, value, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive } = req.body;

    const data = {};
    if (code !== undefined) data.code = code.trim().toUpperCase();
    if (type !== undefined) data.type = type;
    if (value !== undefined) data.value = Number(value);
    if (minOrderValue !== undefined) data.minOrderValue = minOrderValue === "" || minOrderValue == null ? null : Number(minOrderValue);
    if (maxDiscount !== undefined) data.maxDiscount = maxDiscount === "" || maxDiscount == null ? null : Number(maxDiscount);
    if (usageLimit !== undefined) data.usageLimit = usageLimit === "" || usageLimit == null ? null : Number(usageLimit);
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) data.isActive = !!isActive;

    const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data });
    res.json(coupon);
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") return res.status(404).json({ error: "Coupon not found" });
    if (err.code === "P2002") return res.status(409).json({ error: "That coupon code already exists" });
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

// DELETE /api/admin/coupons/:id
router.delete("/coupons/:id", async (req, res) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") return res.status(404).json({ error: "Coupon not found" });
    // A coupon already used on real orders can't be deleted (Order.couponId
    // has no onDelete: Cascade, on purpose — deleting it shouldn't corrupt
    // order history). Deactivate it instead.
    if (err.code === "P2003") {
      return res.status(409).json({
        error: "Can't delete a coupon that's already been used on an order. Deactivate it instead.",
      });
    }
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

module.exports = router;
