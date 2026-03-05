import { Router } from "express";
import Stripe from "stripe";
import { run, get } from "../db.js";

const router = Router();

// Stripe webhook - must use raw body
router.post("/stripe", async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  const { type, data } = event;

  if (type === "checkout.session.completed") {
    const session = data.object;
    const userId = session.metadata?.user_id;
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    if (userId && subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const existing = get("SELECT * FROM subscriptions WHERE user_id = ?", [Number(userId)]);
      if (existing) {
        run(
          "UPDATE subscriptions SET stripe_subscription_id = ?, stripe_customer_id = ?, status = 'active', plan = 'pro', current_period_start = ?, current_period_end = ?, updated_at = datetime('now') WHERE user_id = ?",
          [subscriptionId, customerId, new Date(sub.current_period_start * 1000).toISOString(), new Date(sub.current_period_end * 1000).toISOString(), Number(userId)]
        );
      } else {
        run(
          "INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, plan, current_period_start, current_period_end) VALUES (?, ?, ?, 'active', 'pro', ?, ?)",
          [Number(userId), customerId, subscriptionId, new Date(sub.current_period_start * 1000).toISOString(), new Date(sub.current_period_end * 1000).toISOString()]
        );
      }
    }
  }

  if (type === "customer.subscription.updated" || type === "customer.subscription.deleted") {
    const subscription = data.object;
    const customerId = subscription.customer;
    const sub = get("SELECT * FROM subscriptions WHERE stripe_customer_id = ?", [customerId]);
    if (sub) {
      const status = subscription.status === "active" ? "active" : subscription.status === "canceled" ? "cancelled" : subscription.status;
      run(
        "UPDATE subscriptions SET status = ?, current_period_start = ?, current_period_end = ?, updated_at = datetime('now') WHERE stripe_customer_id = ?",
        [status, new Date(subscription.current_period_start * 1000).toISOString(), new Date(subscription.current_period_end * 1000).toISOString(), customerId]
      );
    }
  }

  if (type === "invoice.payment_failed") {
    const invoice = data.object;
    const customerId = invoice.customer;
    const sub = get("SELECT * FROM subscriptions WHERE stripe_customer_id = ?", [customerId]);
    if (sub) {
      run("UPDATE subscriptions SET status = 'past_due', updated_at = datetime('now') WHERE stripe_customer_id = ?", [customerId]);
    }
  }

  res.json({ received: true });
});

export default router;
