// One-time migration: reads the existing static lib/data.js catalog and
// writes it into the database via Prisma. Run with: npm run db:seed
//
// Safe to re-run — it upserts categories and products by their unique
// slug/sku, so running it twice won't create duplicates.

const { PrismaClient } = require("@prisma/client");
const {
  SHIPYARD_ITEMS,
  DECK_MACHINERY_ITEMS,
  BRONZE_ITEMS,
  BABBIT_LINING_ITEMS,
  FABRICATION_MACHINING_ITEMS,
  BEARING_SERVICES,
} = require("./seed-data.js");

const prisma = new PrismaClient();

// Turns "Aluminium Alloy Life Raft Cradle" into "aluminium-alloy-life-raft-cradle"
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Categories, in the same order/keys used across the Next.js app's
// /products/[category] routes.
const CATEGORIES = [
  {
    slug: "shipyard",
    name: "Shipyard Products",
    code: "01",
    tag: "YD: ASW-SWC 3033–3036",
    blurb:
      "Life raft cradles, lockers, GI stowage boxes, brows and stanchions built to GRSE project specification.",
    items: SHIPYARD_ITEMS,
  },
  {
    slug: "deck",
    name: "Deck Machinery",
    code: "02",
    tag: "YD: SVL 3025–3028",
    blurb:
      "Anchor capstans, windlasses, hydrographic davits and winches engineered for naval deployment.",
    items: DECK_MACHINERY_ITEMS,
  },
  {
    slug: "bronze",
    name: "Bronze Items",
    code: "03",
    tag: "Copper-Base Non-Ferrous",
    blurb:
      "Volute casings, impellers, bushes, strainers and flanges cast to customer-specific tolerances.",
    items: BRONZE_ITEMS,
  },
  {
    slug: "babbit",
    name: "Babbit Lining Bearing and Thrust Pads",
    code: "05",
    tag: "White Metal Lined",
    blurb:
      "Tilting thrust pads, babbit and journal bearings, labyrinth seals and bearing housings lined and machined in-house.",
    items: BABBIT_LINING_ITEMS,
  },
  {
    slug: "fabrication",
    name: "Fabrication and Machining",
    code: "06",
    tag: "Precision Manufactured",
    blurb:
      "Pinions & gears, gear box assemblies, and aluminium/steel gratings fabricated and machined to specification.",
    items: FABRICATION_MACHINING_ITEMS,
  },
];

async function main() {
  console.log("Seeding categories + products...");

  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, code: cat.code, tag: cat.tag, blurb: cat.blurb },
      create: {
        slug: cat.slug,
        name: cat.name,
        code: cat.code,
        tag: cat.tag,
        blurb: cat.blurb,
      },
    });

    for (const item of cat.items) {
      const slug = slugify(item.name);
      const sku = `${cat.slug}-${slug}`.slice(0, 60);
      const images = item.images?.length ? item.images : item.image ? [item.image] : [];

      const product = await prisma.product.upsert({
        where: { slug },
        update: {
          name: item.name,
          tag: item.tag ?? null,
          description: item.desc ?? "",
          categoryId: category.id,
        },
        create: {
          sku,
          slug,
          name: item.name,
          tag: item.tag ?? null,
          description: item.desc ?? "",
          categoryId: category.id,
          // These are real industrial parts (quote-based), not off-the-shelf
          // buyable SKUs — isBuyable defaults to false. Flip specific
          // products to true + set a price once you decide what's sellable
          // directly online.
          isBuyable: false,
          price: null,
          stock: 0,
        },
      });

      // Replace images for this product (simplest way to keep re-runs idempotent)
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      if (images.length) {
        await prisma.productImage.createMany({
          data: images.map((url, i) => ({ url, position: i, productId: product.id })),
        });
      }
    }

    console.log(`  ✓ ${cat.name} (${cat.items.length} products)`);
  }

  // "bearing" category has services, not individually-imaged products —
  // create the category with its service list folded into the blurb so it
  // still shows up in the catalog nav; the CategoryPageClient bearing-grid
  // UI can keep reading BEARING_SERVICES directly, or you can later add a
  // Service model if this needs its own DB-backed content.
  await prisma.category.upsert({
    where: { slug: "bearing" },
    update: {},
    create: {
      slug: "bearing",
      name: "White Metal Lining Bearing and Thrust Pads",
      code: "04",
      tag: "ASNT Level 2 Verified",
      blurb: BEARING_SERVICES.map((s) => `${s.name}: ${s.desc}`).join(" "),
    },
  });
  console.log("  ✓ White Metal Lining Bearing and Thrust Pads (service category)");

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
