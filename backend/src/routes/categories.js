const express = require("express");
const { prisma } = require("../lib/prisma");

const router = express.Router();

// GET /api/categories — used on the homepage products grid
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { code: "asc" },
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/categories/:slug — used on /products/[category] page
router.get("/:slug", async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          where: { isPublished: true },
          include: { images: { orderBy: { position: "asc" } } },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

module.exports = router;
