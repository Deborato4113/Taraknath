const express = require("express");
const { prisma } = require("../lib/prisma");

const router = express.Router();

// Same trust model as cart.js/orders.js — only the Next.js server calls
// these, after it has already verified who's logged in via the session.
function requireInternalSecret(req, res, next) {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(requireInternalSecret);

// GET /api/addresses?userId=xxx
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
});

// POST /api/addresses — { userId, label, line1, line2, city, state, pincode, phone, country }
router.post("/", async (req, res) => {
  try {
    const { userId, label, line1, line2, city, state, pincode, phone, country } = req.body;

    if (!userId || !line1 || !city || !state || !pincode || !phone) {
      return res.status(400).json({ error: "line1, city, state, pincode and phone are required" });
    }

    const address = await prisma.address.create({
      data: { userId, label, line1, line2, city, state, pincode, phone, country },
    });

    res.status(201).json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save address" });
  }
});

// PUT /api/addresses/:id — { userId, ...same fields as POST }
// userId is checked against the existing row so nobody can edit someone
// else's saved address just by guessing an id.
router.put("/:id", async (req, res) => {
  try {
    const { userId, label, line1, line2, city, state, pincode, phone, country } = req.body;

    const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Address not found" });
    }

    const address = await prisma.address.update({
      where: { id: req.params.id },
      data: { label, line1, line2, city, state, pincode, phone, country },
    });

    res.json(address);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update address" });
  }
});

// DELETE /api/addresses/:id?userId=xxx
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.query;

    const existing = await prisma.address.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Address not found" });
    }

    await prisma.address.delete({ where: { id: req.params.id } });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete address" });
  }
});

module.exports = router;
