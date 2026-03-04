import { Router } from "express";
import { get } from "../db.js";
import auth from "../middleware/auth.js";
import { decrypt } from "../services/crypto.js";
import { callAI } from "../services/ai.js";

const router = Router();

const PEXELS_QUERIES = {
  ftb: "first time home buyer couple",
  buybeforesell: "family moving new home",
  investment: "investment property exterior",
  va: "military family home",
  rentvsbuy: "apartment vs house comparison",
};

function getUserKey(userId) {
  const row = get("SELECT * FROM user_settings WHERE user_id = ?", [userId]);
  if (!row?.api_key_enc || !row?.api_key_iv) return null;
  return { key: decrypt(row.api_key_enc, row.api_key_iv), provider: row.ai_provider || "anthropic" };
}

// Generate flyer
router.post("/flyer", auth, async (req, res) => {
  try {
    const creds = getUserKey(req.userId);
    if (!creds) {
      return res.json({
        mock: true,
        data: {
          headline: "YOUR DREAM HOME AWAITS",
          subheadline: "Luxury pool home in Tampa's most sought-after gated community",
          badge: "NEW LISTING",
          bullets: [
            "4 Bed / 3 Bath / 2,340 sq ft",
            "Private screened pool & spa",
            "Chef's kitchen, quartz counters",
            "Conservation lot — no rear neighbors",
          ],
          cta: "Schedule a Private Tour",
          footnote: "Limited showings — contact us today.",
        },
      });
    }

    const { assetLabel, address, price, beds, baths, description } = req.body;
    const prompt = `Marketing flyer copy for a ${assetLabel || "Listing Flyer"}.
Property: ${address || "2847 Cypress Lake Dr, Tampa FL"} | $${price || 489000} | ${beds || 4}bd/${baths || 3}ba
Description: ${description || "Beautiful home."}
Return ONLY JSON: {"headline":"BOLD 4-6 WORD HEADLINE","subheadline":"compelling 10-14 word subline","badge":"2-3 word status badge","bullets":["detail","detail","detail","detail"],"cta":"3-5 word action","footnote":"6-8 word closing tagline"}`;

    const text = await callAI(creds.key, creds.provider, "You write compelling real estate marketing copy. Return ONLY valid JSON.", prompt, 700);
    const data = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json({ mock: false, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate playbook
router.post("/playbook", auth, async (req, res) => {
  try {
    const creds = getUserKey(req.userId);
    if (!creds) {
      return res.json({
        mock: true,
        data: {
          title: `${req.body.assetLabel || "Buyer Guide"} — ${(req.body.states || ["FL"]).join(", ")}`,
          subtitle: "Your complete step-by-step guide to success",
          keyStats: [
            { value: "87%", label: "Success rate" },
            { value: "$24K", label: "Avg savings" },
            { value: "42", label: "Days saved" },
          ],
          pages: [
            { title: "Getting Started", body: "Understanding the process is the first step.", tips: ["Review your credit score", "Gather tax returns", "Get pre-approved"] },
            { title: "The Process", body: "Each stage has key milestones.", tips: ["Work with a professional", "Understand your options", "Ask questions"] },
            { title: "Financing", body: "We break down financing simply.", tips: ["Compare loan types", "Understand rate vs APR", "Lock your rate"] },
            { title: "Closing & Beyond", body: "Here's how to nail the closing.", tips: ["Review Closing Disclosure", "Final walkthrough", "Keep records"] },
            { title: "State Programs", body: `${(req.body.states || ["FL"]).join(", ")} offers unique programs.`, tips: ["Ask about state grants", "Down payment assistance", "Income-based programs"] },
          ],
        },
      });
    }

    const { assetLabel, states } = req.body;
    const prompt = `Create a ${assetLabel || "Buyer Guide"} for ${(states || ["FL"]).join(", ")}.
Return ONLY JSON:
{"title":"Full Playbook Title","subtitle":"One-sentence description","keyStats":[{"value":"X%","label":"stat label"},{"value":"$X","label":"stat label"},{"value":"X","label":"stat label"}],"pages":[{"title":"Chapter title","body":"2-3 sentence intro","tips":["tip 1","tip 2","tip 3"],"stat":{"value":"97%","label":"approval rate"}},{"title":"Chapter 2","body":"...","tips":["..."]},{"title":"Chapter 3","body":"...","tips":["..."],"stat":{"value":"$12K","label":"avg savings"}},{"title":"Chapter 4","body":"...","tips":["..."]},{"title":"Chapter 5","body":"...","tips":["..."]}]}
Include an optional "stat" field (with "value" and "label") on 2-3 pages where a big number adds impact.`;

    const text = await callAI(creds.key, creds.provider, "You create detailed real estate education content. Return ONLY valid JSON.", prompt, 1400);
    const data = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.json({ mock: false, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pexels proxy
router.get("/pexels", auth, async (req, res) => {
  try {
    const { query, per_page = 3 } = req.query;
    if (!query) return res.status(400).json({ error: "query is required" });

    const row = get("SELECT * FROM user_settings WHERE user_id = ?", [req.userId]);
    if (!row?.pexels_key_enc || !row?.pexels_key_iv) {
      return res.json({ photos: [] });
    }
    const pexelsKey = decrypt(row.pexels_key_enc, row.pexels_key_iv);

    const pRes = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per_page}&orientation=landscape`, {
      headers: { Authorization: pexelsKey },
    });
    if (!pRes.ok) return res.json({ photos: [] });
    const data = await pRes.json();
    res.json({ photos: (data.photos || []).map(p => ({ id: p.id, src: p.src?.large || p.src?.medium, alt: p.alt })) });
  } catch (err) {
    res.json({ photos: [] });
  }
});

// Enhance description — AI polish for property descriptions
router.post("/enhance-description", auth, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description?.trim()) return res.json({ enhanced: description || "" });

    const creds = getUserKey(req.userId);
    if (!creds) {
      // No API key — return a lightly polished version via simple string transforms
      const enhanced = description.trim()
        .replace(/\b(\w)/g, (m, c) => c.toUpperCase())
        .replace(/\.(\s|$)/g, ". ")
        .trim();
      return res.json({ enhanced: enhanced || description });
    }

    const prompt = `Polish this real estate property description. Make it compelling, professional, and concise (2-3 sentences max). Keep all factual details. Do NOT add made-up features. Return ONLY the polished text, no quotes or explanation.\n\nOriginal: ${description}`;

    const text = await callAI(creds.key, creds.provider, "You are a real estate copywriter. Return only the polished description text.", prompt, 300);
    res.json({ enhanced: text.trim() });
  } catch (err) {
    res.json({ enhanced: req.body.description || "" });
  }
});

export default router;
