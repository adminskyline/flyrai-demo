import { Router } from "express";
import { run, get } from "../db.js";
import auth from "../middleware/auth.js";
import { encrypt } from "../services/crypto.js";

const router = Router();

router.get("/", auth, (req, res) => {
  const row = get("SELECT * FROM user_settings WHERE user_id = ?", [req.userId]);
  res.json({
    ai_provider: row?.ai_provider || null,
    hasApiKey: !!(row?.api_key_enc),
    hasPexelsKey: !!(row?.pexels_key_enc),
  });
});

router.put("/", auth, (req, res) => {
  const { ai_provider, api_key } = req.body;

  // Ensure row exists
  run("INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)", [req.userId]);

  if (ai_provider !== undefined) {
    run("UPDATE user_settings SET ai_provider = ? WHERE user_id = ?", [ai_provider, req.userId]);
  }
  if (api_key) {
    const { encrypted, iv } = encrypt(api_key);
    run("UPDATE user_settings SET api_key_enc = ?, api_key_iv = ? WHERE user_id = ?", [encrypted, iv, req.userId]);
  }

  const { pexels_key } = req.body;
  if (pexels_key) {
    const { encrypted, iv } = encrypt(pexels_key);
    run("UPDATE user_settings SET pexels_key_enc = ?, pexels_key_iv = ? WHERE user_id = ?", [encrypted, iv, req.userId]);
  }

  const row = get("SELECT * FROM user_settings WHERE user_id = ?", [req.userId]);
  res.json({
    ai_provider: row?.ai_provider || null,
    hasApiKey: !!(row?.api_key_enc),
    hasPexelsKey: !!(row?.pexels_key_enc),
  });
});

export default router;
