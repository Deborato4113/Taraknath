const express = require("express");
const bcrypt = require("bcryptjs");
const { prisma } = require("../lib/prisma");
const firebaseAdmin = require("../lib/firebaseAdmin");

const router = express.Router();

// Strips the password hash off a user object before it ever leaves this server
function toSafeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// POST /api/auth/register — { name, email, password }
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    res.status(201).json(toSafeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register" });
  }
});

// POST /api/auth/login — { email, password }
// Called by NextAuth's Credentials provider on the frontend, not by the
// browser directly. Returns the user (no password) on success.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Same error for "no such user" and "wrong password" — don't reveal
    // which one it was, that just helps someone enumerate real emails.
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json(toSafeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log in" });
  }
});

// POST /api/auth/firebase-login — { idToken }
// Called by NextAuth's "firebase" Credentials provider after the browser
// completes the Google sign-in popup via Firebase. We verify the token
// with Google (never trust it just because the browser sent it), then:
//   - existing user (matched by email) → log them in
//   - no such user → create one on the spot, same as clicking "Continue
//     with Google" auto-registers you on most commercial sites
router.post("/firebase-login", async (req, res) => {
  try {
    if (!firebaseAdmin.apps.length) {
      return res.status(500).json({
        error:
          "Server is missing Firebase Admin credentials. See backend/src/lib/firebaseAdmin.js for setup steps.",
      });
    }

    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "idToken is required" });
    }

    // Throws if the token is invalid, expired, or wasn't issued for this
    // Firebase project — that's what actually proves this is a real,
    // Google-verified sign-in and not just a forged request.
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

    const email = decoded.email;
    if (!email) {
      return res.status(400).json({ error: "Google account has no email" });
    }
    if (decoded.email_verified === false) {
      return res.status(403).json({ error: "Google email is not verified" });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // First time we've seen this email — register them automatically.
      // No password: this account can only ever sign in via Google.
      user = await prisma.user.create({
        data: {
          name: decoded.name || email.split("@")[0],
          email,
          image: decoded.picture || null,
          emailVerified: new Date(),
        },
      });
    } else if (!user.image && decoded.picture) {
      // Existing account (e.g. originally signed up with email/password)
      // now also using Google — pick up their profile photo if they
      // didn't already have one.
      user = await prisma.user.update({
        where: { id: user.id },
        data: { image: decoded.picture },
      });
    }

    res.json(toSafeUser(user));
  } catch (err) {
    console.error("Firebase login error:", err);
    res.status(401).json({ error: "Invalid or expired Google sign-in" });
  }
});

// Same trust model as cart.js/orders.js — only the Next.js server calls
// these, after it has already verified who's logged in via the session.
function requireInternalSecret(req, res, next) {
  const secret = req.headers["x-internal-secret"];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// GET /api/auth/me?userId=xxx — used by the /account page
router.get("/me", requireInternalSecret, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(toSafeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch account" });
  }
});

// PUT /api/auth/me — { userId, name, phone } — used by the /account page's
// edit form. Deliberately doesn't accept email or password here — changing
// those needs its own verification flow, not a plain profile edit.
router.put("/me", requireInternalSecret, async (req, res) => {
  try {
    const { userId, name, phone } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, phone },
    });

    res.json(toSafeUser(user));
  } catch (err) {
    console.error(err);
    if (err.code === "P2025") return res.status(404).json({ error: "User not found" });
    res.status(500).json({ error: "Failed to update account" });
  }
});

module.exports = router;
