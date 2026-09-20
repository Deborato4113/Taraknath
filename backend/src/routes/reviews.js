const express = require("express");
const { prisma } = require("../lib/prisma");

const router = express.Router();

// Same trust model as cart.js/orders.js/wishlist.js — only the Next.js
// server calls this, having already checked login (for writes) via NextAuth.
function requireInternalSecret(req, res, next) {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(requireInternalSecret);

// Orders whose payment actually succeeded — used both to decide the
// "Verified Purchase" badge and (implicitly) to keep it honest: an order
// that's still PENDING or was CANCELLED never earns the badge.
const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

// GET /api/reviews?productId=xxx
// Public data (no userId needed) — returns every review for a product
// plus the aggregate rating, so the frontend doesn't have to compute the
// average itself from a full list every time.
router.get("/", async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ error: "productId is required" });

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const count = reviews.length;
    const average = count === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / count;

    res.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        createdAt: r.createdAt,
        userId: r.userId,
        userName: r.user?.name || "Anonymous",
      })),
      average: Math.round(average * 10) / 10,
      count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// POST /api/reviews — { userId, productId, rating, comment }
// One review per user per product — submitting again (e.g. editing) just
// overwrites the existing one via upsert, rather than erroring or
// creating a duplicate.
router.post("/", async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: "userId and productId are required" });
    }
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: "rating must be a whole number from 1 to 5" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    // A "Verified Purchase" badge — true if this user has a successfully
    // paid order containing this exact product. Computed fresh at
    // create/update time, then stored (see schema comment on the field).
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId, status: { in: PAID_STATUSES } },
      },
    });

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId, productId } },
      update: {
        rating: ratingNum,
        comment: comment || null,
        isVerifiedPurchase: !!purchase,
      },
      create: {
        userId,
        productId,
        rating: ratingNum,
        comment: comment || null,
        isVerifiedPurchase: !!purchase,
      },
      include: { user: { select: { name: true } } },
    });

    res.status(201).json({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      isVerifiedPurchase: review.isVerifiedPurchase,
      createdAt: review.createdAt,
      userId: review.userId,
      userName: review.user?.name || "Anonymous",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// DELETE /api/reviews/:id?userId=xxx — a user can only delete their own review
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.query;
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });

    if (!review || review.userId !== userId) {
      return res.status(404).json({ error: "Review not found" });
    }

    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
