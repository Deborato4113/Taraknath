const express = require("express");
const { prisma } = require("../lib/prisma");

const router = express.Router();

// This API is only ever called by the Next.js server (never directly from
// a browser) — the frontend authenticates the user via NextAuth, then
// forwards the trusted userId here along with this shared secret. Without
// this check, anyone could pass any userId and read/edit someone else's cart.
function requireInternalSecret(req, res, next) {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(requireInternalSecret);

// Shared shape returned by every route below, so the frontend never has to
// guess whether it got a single item, an array, or nothing back — every
// mutation just re-fetches and returns the whole current cart + its total.
async function getCartPayload(userId) {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } },
    },
    orderBy: { createdAt: "asc" },
  });

  const items = rows.map((row) => ({
    id: row.id,
    quantity: row.quantity,
    product: {
      id: row.product.id,
      name: row.product.name,
      slug: row.product.slug,
      price: row.product.price,
      stock: row.product.stock,
      image: row.product.images[0]?.url ?? null,
    },
  }));

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price ?? 0) * item.quantity,
    0
  );

  return { items, subtotal };
}

// GET /api/cart?userId=xxx
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    res.json(await getCartPayload(userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// POST /api/cart — { userId, productId, quantity } — add or increment
router.post("/", async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ error: "userId and productId are required" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isBuyable) {
      return res.status(400).json({ error: "This product isn't available for purchase" });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({ data: { userId, productId, quantity } });
    }

    res.status(201).json(await getCartPayload(userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// PATCH /api/cart/:itemId — { userId, quantity } — set an exact quantity
router.patch("/:itemId", async (req, res) => {
  try {
    const { userId, quantity } = req.body;
    const { itemId } = req.params;

    if (!userId || !quantity || quantity < 1) {
      return res.status(400).json({ error: "userId and a quantity of at least 1 are required" });
    }

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.userId !== userId) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });

    res.json(await getCartPayload(userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

// DELETE /api/cart/:itemId?userId=xxx
router.delete("/:itemId", async (req, res) => {
  try {
    const { userId } = req.query;
    const { itemId } = req.params;

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.userId !== userId) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    // Always a 200 + JSON body (never 204) — cartServer.js on the frontend
    // unconditionally parses the response as JSON, so an empty body here
    // would crash that call.
    res.json(await getCartPayload(userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

module.exports = router;
