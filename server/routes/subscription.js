import { Router } from "express";
import Stripe from "stripe";
import { run, get } from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

// Get subscription status
router.get("/status", auth, (req, res) => {
  const sub = get("SELECT * FROM subscriptions WHERE user_id = ?", [req.userId]);
  if (!sub) {
    return res.json({ status: "inactive", plan: null });
  }
  res.json({
    status: sub.status,
    plan: sub.plan,
    current_period_end: sub.current_period_end,
    stripe_customer_id: sub.stripe_customer_id,
  });
});

// Create checkout session
router.post("/create-checkout", auth, async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const user = get("SELECT * FROM users WHERE id = ?", [req.userId]);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check for existing Stripe customer
    let sub = get("SELECT * FROM subscriptions WHERE user_id = ?", [req.userId]);
    let customerId = sub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { user_id: String(user.id) },
      });
      customerId = customer.id;

      if (sub) {
        run("UPDATE subscriptions SET stripe_customer_id = ? WHERE user_id = ?", [customerId, req.userId]);
      } else {
        run("INSERT INTO subscriptions (user_id, stripe_customer_id, status) VALUES (?, ?, 'inactive')", [req.userId, customerId]);
      }
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return res.status(500).json({ error: "Stripe price not configured" });
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}?subscription=success`,
      cancel_url: `${baseUrl}?subscription=cancelled`,
      metadata: { user_id: String(user.id) },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create portal session (manage subscription)
router.post("/portal", auth, async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

    const sub = get("SELECT * FROM subscriptions WHERE user_id = ?", [req.userId]);
    if (!sub?.stripe_customer_id) {
      return res.status(400).json({ error: "No subscription found" });
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: baseUrl,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
