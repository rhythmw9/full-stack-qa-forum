// Auth routes: register, login, and current user

import { Router } from "express";
import bcrypt from "bcrypt";
import { query } from "../db.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

// Registers a new user, hashes password, checks for errors
router.post("/register", async (req, res, next) => {
  try {
    let { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, and password are required" });
    }

    username = String(username).trim();
    email = String(email).trim().toLowerCase();
    password = String(password);

    if (username.length < 3) return res.status(400).json({ error: "Username too short" });
    if (!email.includes("@")) return res.status(400).json({ error: "Invalid email" });
    if (password.length < 6) return res.status(400).json({ error: "Password too short (min 6)" });

    // Check existing user
    const existing = await query(
      "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
      [email, username]
    );
    if (existing.length) {
      return res.status(409).json({ error: "Email or username already in use" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hash]
    );

    const user = { id: result.insertId, username, email };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    // Handle duplicate key edge-case
    if (err && err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email or username already in use" });
    }
    next(err);
  }
});


// Logs user in, verifies password hash, checks errors
router.post("/login", async (req, res, next) => {
  try {
    const { email, username, password } = req.body || {};
    if (!password || (!email && !username)) {
      return res.status(400).json({ error: "Provide email or username, and password" });
    }

    const identifier = email ? String(email).trim().toLowerCase() : String(username).trim();

    const rows = await query(
      email
        ? "SELECT id, username, email, password_hash FROM users WHERE email = ? LIMIT 1"
        : "SELECT id, username, email, password_hash FROM users WHERE username = ? LIMIT 1",
      [identifier]
    );
    if (!rows.length) return res.status(400).json({ error: "Invalid login" });

    const userRow = rows[0];
    const ok = await bcrypt.compare(String(password), userRow.password_hash);
    if (!ok) return res.status(400).json({ error: "Invalid login" });

    const user = { id: userRow.id, username: userRow.username, email: userRow.email };
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});


// Returns authenticated user's profile
router.get("/me", requireAuth, async (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, email: req.user.email });
});

export default router;
