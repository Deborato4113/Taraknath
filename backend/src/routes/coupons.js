const express = require("express");
const { prisma } = require("../lib/prisma");

const router = express.Router();

// Same trust model as cart.js/orders.js — only the Next.js server calls this.
function requireInternalSecret(req, res, next) {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

router.use(requireInternalSecret);

// Shared logic so /validate (checkout preview) and orders.js (actually
// placing the order) can never disagree about whether a coupon applies —
// orders.js calls this same function directly rather than re-implementing it.
async function evaluateCoupon(code, subtotal) {
  if (!code) return { valid: false, message: "Enter a coupon code" };

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) return { valid: false, message: "Invalid coupon code" };
  if (!coupon.isActive) return { valid: false, message: "This coupon is no longer active" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, message: "This coupon has expired" };
  }
  if (coupon.usageLimit != null && coupon.timesUsed >= coupon.usageLimit) {
    return { valid: false, message: "This coupon has reached its usage limit" };
  }
  if (coupon.minOrderValue != null && subtotal < Number(coupon.minOrderValue)) {
    return {
      valid: false,
      message: `This coupon needs a minimum order of ₹${Number(coupon.minOrderValue).toLocaleString("en-IN")}`,
    };
  }

  let discount =
    coupon.type === "PERCENT" ? (subtotal * Number(coupon.value)) / 100 : Number(coupon.value);

  if (coupon.type === "PERCENT" && coupon.maxDiscount != null) {
    discount = Math.min(discount, Number(coupon.maxDiscount));
  }
  // Never let a coupon make the order free or negative.
  discount = Math.min(discount, subtotal);
  discount = Math.round(discount * 100) / 100;

  return {
    valid: true,
    coupon,
    discount,
    message:
      coupon.type === "PERCENT"
        ? `${Number(coupon.value)}% off applied`
        : `₹${Number(coupon.value).toLocaleString("en-IN")} off applied`,
  };
}

// POST /api/coupons/validate — { code, subtotal }
// Used by the checkout page to preview a discount before the order is
// actually placed. Doesn't touch timesUsed — that only happens once an
// order is genuinely created (see orders.js), so previewing a coupon can
// never burn down its usage limit.
router.post("/validate", async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (subtotal == null) return res.status(400).json({ error: "subtotal is required" });

    const result = await evaluateCoupon(code, Number(subtotal));
    if (!result.valid) return res.status(400).json({ valid: false, message: result.message });

    res.json({
      valid: true,
      code: result.coupon.code,
      type: result.coupon.type,
      value: Number(result.coupon.value),
      discount: result.discount,
      message: result.message,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
});

module.exports = router;
module.exports.evaluateCoupon = evaluateCoupon;
