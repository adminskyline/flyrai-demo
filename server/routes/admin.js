import { Router } from "express";
import { get, all } from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

// Admin middleware - check is_admin flag
function adminOnly(req, res, next) {
  const user = get("SELECT * FROM users WHERE id = ?", [req.userId]);
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Dashboard stats
router.get("/stats", auth, adminOnly, (_req, res) => {
  const totalUsers = get("SELECT COUNT(*) as count FROM users");
  const activeSubscriptions = get("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'");
  const totalItems = get("SELECT COUNT(*) as count FROM saved_items");
  const recentUsers = get("SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')");

  res.json({
    totalUsers: totalUsers?.count || 0,
    activeSubscriptions: activeSubscriptions?.count || 0,
    totalItems: totalItems?.count || 0,
    recentUsers: recentUsers?.count || 0,
  });
});

// List all users with subscription data
router.get("/users", auth, adminOnly, (_req, res) => {
  const users = all(`
    SELECT
      u.id, u.email, u.name, u.account_type, u.phone, u.company, u.created_at, u.is_admin,
      s.status as sub_status, s.plan as sub_plan, s.stripe_customer_id, s.stripe_subscription_id,
      s.current_period_end as sub_expires,
      (SELECT COUNT(*) FROM saved_items WHERE user_id = u.id) as item_count
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id
    ORDER BY u.created_at DESC
  `);
  res.json({ users });
});

// Get single user detail
router.get("/users/:id", auth, adminOnly, (req, res) => {
  const user = get(`
    SELECT
      u.id, u.email, u.name, u.account_type, u.title, u.phone, u.company,
      u.nmls, u.company_nmls, u.license, u.states, u.created_at, u.is_admin,
      s.status as sub_status, s.plan as sub_plan, s.stripe_customer_id,
      s.stripe_subscription_id, s.current_period_start as sub_start,
      s.current_period_end as sub_expires, s.created_at as sub_created
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id
    WHERE u.id = ?
  `, [Number(req.params.id)]);

  if (!user) return res.status(404).json({ error: "User not found" });

  const items = all("SELECT id, item_type, asset_id, label, created_at FROM saved_items WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", [Number(req.params.id)]);

  res.json({ user, items });
});

// Subscription summary
router.get("/subscriptions", auth, adminOnly, (_req, res) => {
  const subscriptions = all(`
    SELECT
      s.*, u.email, u.name, u.company
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.updated_at DESC
  `);
  res.json({ subscriptions });
});

export default router;
