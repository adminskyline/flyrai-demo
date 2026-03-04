import { Router } from "express";
import { run, get, all } from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

// List saved items
router.get("/", auth, (req, res) => {
  const items = all("SELECT * FROM saved_items WHERE user_id = ? ORDER BY created_at DESC", [req.userId]);
  res.json({
    items: items.map((item) => ({
      ...item,
      generated_data: JSON.parse(item.generated_data),
      property_data: item.property_data ? JSON.parse(item.property_data) : null,
      profile_data: JSON.parse(item.profile_data),
      partner_data: item.partner_data ? JSON.parse(item.partner_data) : null,
      settings_data: JSON.parse(item.settings_data),
    })),
  });
});

// Save an item
router.post("/", auth, (req, res) => {
  const { item_type, asset_id, label, generated_data, property_data, profile_data, partner_data, settings_data } = req.body;
  if (!item_type || !asset_id || !generated_data || !profile_data || !settings_data) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const result = run(
    `INSERT INTO saved_items (user_id, item_type, asset_id, label, generated_data, property_data, profile_data, partner_data, settings_data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.userId,
      item_type,
      asset_id,
      label || "",
      JSON.stringify(generated_data),
      property_data ? JSON.stringify(property_data) : null,
      JSON.stringify(profile_data),
      partner_data ? JSON.stringify(partner_data) : null,
      JSON.stringify(settings_data),
    ]
  );
  res.json({ id: result.lastInsertRowid });
});

// Delete an item
router.delete("/:id", auth, (req, res) => {
  const result = run("DELETE FROM saved_items WHERE id = ? AND user_id = ?", [
    Number(req.params.id),
    req.userId,
  ]);
  if (result.changes === 0) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
