import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { run, get } from "../db.js";
import authMw from "../middleware/auth.js";

const router = Router();
const SECRET = process.env.JWT_SECRET || "fallback-secret";

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "7d" });
}

function sanitizeUser(row) {
  const { password_hash, ...rest } = row;
  const user = { ...rest, states: JSON.parse(rest.states || '["FL"]') };
  // Attach subscription status
  const sub = get("SELECT status, plan, current_period_end FROM subscriptions WHERE user_id = ?", [row.id]);
  user.subscription = sub ? { status: sub.status, plan: sub.plan, expires: sub.current_period_end } : { status: "inactive", plan: null };
  return user;
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, accountType, name } = req.body;
    if (!email || !password || !accountType || !name) {
      return res.status(400).json({ error: "email, password, accountType, and name are required" });
    }
    if (!["lo", "realtor"].includes(accountType)) {
      return res.status(400).json({ error: "accountType must be 'lo' or 'realtor'" });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = run(
      "INSERT INTO users (email, password_hash, account_type, name) VALUES (?, ?, ?, ?)",
      [email.toLowerCase(), hash, accountType, name]
    );

    // Create empty settings row
    run("INSERT INTO user_settings (user_id) VALUES (?)", [result.lastInsertRowid]);

    const user = get("SELECT * FROM users WHERE id = ?", [result.lastInsertRowid]);
    const token = makeToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    if (err.message?.includes("UNIQUE constraint")) {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const user = get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = makeToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get("/me", authMw, (req, res) => {
  const user = get("SELECT * FROM users WHERE id = ?", [req.userId]);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: sanitizeUser(user) });
});

export default router;
