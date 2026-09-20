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

// GET /api/products/related?category=deck&exclude=id1,id2&limit=4
// Powers "You may also like" (product page) and "Frequently bought
// together" (cart page) — both are just "other published, buyable
// products in the same category(ies)". Kept intentionally simple: no ML,
// just same-category, in-stock-first ordering. Must be declared BEFORE
// the /:slug route below, otherwise Express would try to match "related"
// itself as a product slug.
router.get("/related", async (req, res) => {
  try {
    const { category, exclude, limit } = req.query;
    if (!category) return res.json([]);

    // Supports one category slug or a comma-separated list, so the cart
    // page can ask for recommendations spanning every category currently
    // in the cart in a single request.
    const categorySlugs = category.split(",").map((s) => s.trim()).filter(Boolean);
    const excludeIds = (exclude || "").split(",").map((s) => s.trim()).filter(Boolean);
    const take = Math.min(Number(limit) || 4, 12);

    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        isBuyable: true,
        category: { slug: { in: categorySlugs } },
        ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
      },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
      },
      orderBy: [{ stock: "desc" }, { createdAt: "desc" }],
      take,
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch related products" });
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
