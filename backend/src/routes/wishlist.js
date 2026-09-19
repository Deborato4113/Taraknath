const express = require("express");
const { prisma } = require("../lib/prisma");

const router = express.Router();

function requireInternalSecret(req, res, next) {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(requireInternalSecret);

// GET /api/wishlist?userId=xxx
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: { include: { images: { orderBy: { position: "asc" } }, category: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// POST /api/wishlist — { userId, productId }
router.post("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: "userId and productId are required" });
    }

    // Idempotent — saving something already saved just returns the
    // existing row instead of erroring, so the frontend heart-toggle
    // never has to worry about double-clicks.
    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save to wishlist" });
  }
});

// DELETE /api/wishlist/:productId?userId=xxx
router.delete("/:productId", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    await prisma.wishlistItem.deleteMany({
      where: { userId, productId: req.params.productId },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

module.exports = router;
