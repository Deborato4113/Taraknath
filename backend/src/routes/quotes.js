const express = require("express");
const { prisma } = require("../lib/prisma");
const { sendQuoteRequestEmail } = require("../lib/email");

const router = express.Router();

function requireInternalSecret(req, res, next) {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(requireInternalSecret);

// POST /api/quotes — { userId, projectRef, message, items: [{productId, quantity, note}] }
router.post("/", async (req, res) => {
  try {
    const { userId, projectRef, message, items } = req.body;

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "At least one item is required" });
    }
    if (items.some((i) => !i.productId || !i.quantity || i.quantity < 1)) {
      return res.status(400).json({ error: "Each item needs a product and a quantity of at least 1" });
    }

    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        userId,
        projectRef: projectRef || null,
        message: message || null,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: Number(i.quantity),
            note: i.note || null,
          })),
        },
      },
      include: {
        user: true,
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
    });

    sendQuoteRequestEmail({ quoteRequest, user: quoteRequest.user }).catch(() => {});

    res.status(201).json(quoteRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit quote request" });
  }
});

// GET /api/quotes?userId=xxx — the customer's own quote requests
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const quotes = await prisma.quoteRequest.findMany({
      where: { userId },
      include: { items: { include: { product: { select: { name: true, sku: true, slug: true } } } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(quotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quote requests" });
  }
});

module.exports = router;
