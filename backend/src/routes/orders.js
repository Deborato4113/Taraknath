const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { prisma } = require("../lib/prisma");
const { sendOrderConfirmationEmail, sendLowStockAlert, LOW_STOCK_THRESHOLD } = require("../lib/email");
const { evaluateCoupon } = require("./coupons");

const router = express.Router();

function requireInternalSecret(req, res, next) {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(requireInternalSecret);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/orders — { userId, address: {line1, line2, city, state, pincode, phone} }
// Reads the user's current cart, computes the total from the DATABASE'S
// product prices (never trusts any price the client might send), creates
// an Order + OrderItems + a Razorpay order, and returns what the frontend
// needs to open the Razorpay checkout popup.
router.post("/", async (req, res) => {
  try {
    const { userId, address, couponCode } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Your cart is empty" });
    }

    // Re-check every item is still buyable and in stock — the cart could be
    // stale if an admin changed something after it was added.
    for (const item of cartItems) {
      if (!item.product.isBuyable) {
        return res.status(400).json({ error: `${item.product.name} is no longer available` });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${item.product.name}` });
      }
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    // Re-validate the coupon server-side — never trust a discount amount
    // the client might send. If the code no longer applies (expired, over
    // its usage limit, cart changed since it was applied at checkout), the
    // order simply proceeds without a discount rather than failing outright.
    let discount = 0;
    let couponId = null;
    let couponResult = null;
    if (couponCode) {
      couponResult = await evaluateCoupon(couponCode, subtotal);
      if (couponResult.valid) {
        discount = couponResult.discount;
        couponId = couponResult.coupon.id;
      } else {
        return res.status(400).json({ error: couponResult.message || "Coupon can no longer be applied" });
      }
    }

    const total = Math.max(subtotal - discount, 0); // add shipping/tax logic here later if needed

    let addressId = null;
    if (address) {
      const savedAddress = await prisma.address.create({
        data: { userId, ...address },
      });
      addressId = savedAddress.id;
    }

    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        subtotal,
        discount,
        total,
        couponId,
        status: "PENDING",
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // snapshot — future price changes won't affect this order
          })),
        },
      },
    });

    // Reserve the redemption now, at order-creation time, not at payment
    // verification — this stops two people racing for the last few uses of
    // a limited coupon from both succeeding. If the payment is later never
    // completed, the order just stays PENDING; we don't refund the usage
    // slot, matching how stock isn't refunded for an abandoned order either.
    if (couponId) {
      await prisma.coupon.update({ where: { id: couponId }, data: { timesUsed: { increment: 1 } } });
    }

    // Razorpay wants the amount in the smallest currency unit (paise for INR)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: order.id,
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: total,
        status: "CREATED",
      },
    });

    res.status(201).json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// POST /api/orders/verify — { userId, orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Called after Razorpay's checkout popup succeeds. Verifies the payment is
// genuine (not spoofed) by recomputing the HMAC signature ourselves —
// trusting the frontend's "it succeeded" claim alone would let anyone mark
// any order as paid without actually paying.
router.post("/verify", async (req, res) => {
  try {
    const {
      userId,
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!userId || !orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (!order.payment || order.payment.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ error: "Order/payment mismatch" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: "FAILED" },
      });
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Signature is genuine — mark everything paid, decrement stock, and
    // clear the items that were just purchased out of the cart.
    const updatedProducts = await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: {
          status: "SUCCESS",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        // Goes straight to PROCESSING rather than lingering at PAID —
        // "payment received" and "now being prepared" happen at the same
        // moment here, and neither PAID nor PROCESSING is something an
        // admin sets manually (see admin.js's status route). The admin's
        // first manual action on an order is marking it SHIPPED.
        data: { status: "PROCESSING" },
      });

      const orderItems = await tx.orderItem.findMany({ where: { orderId: order.id } });
      const updated = [];
      for (const item of orderItems) {
        const product = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        updated.push(product);
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return updated;
    });

    // Email sending happens after the transaction has committed, and never
    // blocks or fails the response — the payment is already done and
    // verified at this point, so a flaky email provider shouldn't turn
    // into an error shown to a customer who already paid.
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } }, user: true, coupon: true },
    });
    sendOrderConfirmationEmail({ order: fullOrder, user: fullOrder.user }).catch(() => {});

    for (const product of updatedProducts) {
      if (product.stock <= LOW_STOCK_THRESHOLD) {
        sendLowStockAlert({ product }).catch(() => {});
      }
    }

    res.json({ ok: true, orderId: order.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// POST /api/orders/track — { orderId, contact } — guest order tracking,
// no login required. "contact" can be the email on the account or the
// phone number used at checkout; either has to match, or nothing is
// returned. Deliberately returns the SAME generic error whether the order
// doesn't exist or the contact just doesn't match it — telling those apart
// would let someone enumerate valid order IDs by trial and error.
router.post("/track", async (req, res) => {
  try {
    const { orderId, contact } = req.body;
    if (!orderId || !contact) {
      return res.status(400).json({ error: "Order ID and email or phone are required" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId.trim() },
      include: {
        items: { include: { product: { select: { name: true, slug: true } } } },
        address: true,
        user: { select: { email: true, phone: true } },
        coupon: { select: { code: true } },
      },
    });

    const NOT_FOUND = { error: "No order found matching that Order ID and contact detail" };
    if (!order) return res.status(404).json(NOT_FOUND);

    const contactNormalized = contact.trim().toLowerCase();
    const matchesEmail = order.user.email?.toLowerCase() === contactNormalized;
    const matchesPhone =
      order.user.phone === contact.trim() || order.address?.phone === contact.trim();

    if (!matchesEmail && !matchesPhone) {
      return res.status(404).json(NOT_FOUND);
    }

    // Only what's needed to show order status — no user object, no
    // address beyond city/state (not the full street address to a
    // still-anonymous requester).
    res.json({
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      coupon: order.coupon,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        price: i.price,
        product: i.product,
      })),
      shippingCity: order.address?.city ?? null,
      shippingState: order.address?.state ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to look up order" });
  }
});

// GET /api/orders?userId=xxx — order history list, used by /account/orders.
// This has to come before the /:orderId route below, otherwise Express
// would try to match "orders?userId=..." itself as an :orderId param.
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: { select: { name: true, slug: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/:orderId?userId=xxx — order confirmation details
router.get("/:orderId", async (req, res) => {
  try {
    const { userId } = req.query;
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: { items: { include: { product: true } }, address: true, coupon: true },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// POST /api/orders/:orderId/reorder — { userId }
// Adds every item from a past order back into the cart. Silently skips
// items that are no longer buyable or out of stock, and reports which
// ones it skipped so the frontend can tell the customer.
router.post("/:orderId/reorder", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: "Order not found" });
    }

    const skipped = [];
    let addedCount = 0;

    for (const item of order.items) {
      const product = item.product;

      if (!product.isBuyable || product.stock < 1) {
        skipped.push(product.name);
        continue;
      }

      // Cap at whatever stock is actually available now — the order may
      // have been for more than is currently in stock.
      const quantity = Math.min(item.quantity, product.stock);

      const existing = await prisma.cartItem.findUnique({
        where: { userId_productId: { userId, productId: product.id } },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        });
      } else {
        await prisma.cartItem.create({ data: { userId, productId: product.id, quantity } });
      }

      addedCount++;
    }

    res.json({ addedCount, skipped });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reorder" });
  }
});

module.exports = router;
