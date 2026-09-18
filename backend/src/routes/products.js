const express = require("express");
const { prisma } = require("../lib/prisma");

const router = express.Router();

// GET /api/products?category=deck&q=bush&minPrice=100&maxPrice=5000&inStock=true&sort=price_asc
// All filters are optional and combine — used by both the per-category
// pages (category only) and the /products search page (any combination).
router.get("/", async (req, res) => {
  try {
    const { category, q, minPrice, maxPrice, inStock, sort } = req.query;

    const where = {
      isPublished: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(inStock === "true" ? { stock: { gt: 0 } } : {}),
    };

    if (q) {
      // No `mode: "insensitive"` here — that's a Postgres-only Prisma
      // option and this schema targets MySQL, where the default column
      // collation already makes `contains` case-insensitive.
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: Number(minPrice) } : {}),
        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
      };
    }

    const orderBy =
      sort === "price_asc" ? { price: "asc" } :
      sort === "price_desc" ? { price: "desc" } :
      sort === "newest" ? { createdAt: "desc" } :
      { createdAt: "asc" }; // default — original display order

    const products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" } },
        category: true,
      },
      orderBy,
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /api/products/:slug — used on /products/[category]/[productId] page
router.get("/:slug", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { position: "asc" } },
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

module.exports = router;
