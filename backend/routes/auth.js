const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

function isStrongPassword(password) {
  // >= 8, 1 lower, 1 upper, 1 number, 1 special.
  if (typeof password !== "string") return false;
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error("Missing JWT_SECRET in environment");
    err.statusCode = 500;
    throw err;
  }
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    secret,
    { expiresIn: "24h" }
  );
}

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be 8+ chars and include upper, lower, number, and special character",
      });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: "user",
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email)) return res.status(400).json({ message: "Invalid email" });
    if (typeof password !== "string" || !password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    return res.json({ token, user: user.toSafeJSON() });
  } catch (e) {
    next(e);
  }
});

module.exports = router;

