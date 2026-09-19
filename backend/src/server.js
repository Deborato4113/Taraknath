require("dotenv").config();
const express = require("express");
const cors = require("cors");

const categoriesRouter = require("./routes/categories");
const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");
const adminRouter = require("./routes/admin");
const addressesRouter = require("./routes/addresses");
const wishlistRouter = require("./routes/wishlist");
const quotesRouter = require("./routes/quotes");

const app = express();
const PORT = process.env.PORT || 4000;

// Allow the Next.js frontend (running on a different port/domain) to call this API
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);
app.use(express.json());

// Health check — useful once this is deployed, to confirm it's alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/quotes", quotesRouter);

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
