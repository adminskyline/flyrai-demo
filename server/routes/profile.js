import { Router } from "express";
import { run, get } from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/", auth, (req, res) => {
  const user = get("SELECT * FROM users WHERE id = ?", [req.userId]);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { password_hash, ...profile } = user;
  profile.states = JSON.parse(profile.states || '["FL"]');
  res.json({ profile });
});

router.put("/", auth, (req, res) => {
  const allowed = ["name", "title", "phone", "company", "nmls", "company_nmls", "license", "states", "headshot_url"];
  const sets = [];
  const values = [];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      sets.push(`${key} = ?`);
      values.push(key === "states" ? JSON.stringify(req.body[key]) : req.body[key]);
    }
  }
  if (sets.length === 0) return res.status(400).json({ error: "No valid fields" });
  values.push(req.userId);
  run(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, values);
  const user = get("SELECT * FROM users WHERE id = ?", [req.userId]);
  const { password_hash, ...profile } = user;
  profile.states = JSON.parse(profile.states || '["FL"]');
  res.json({ profile });
});

export default router;
