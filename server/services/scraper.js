import { callAI } from "./ai.js";

function extractImagesFromScriptData(html) {
  const urls = new Set();
  const imgUrlRe = /https?:\/\/[^\s"'<>\\)]+\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>\\)]*)?/gi;

  // 1. __NEXT_DATA__ (used by Zillow, Realtor.com, and other Next.js sites)
  const nextDataRe = /<script\s+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = nextDataRe.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const walkJson = (obj, depth = 0) => {
        if (depth > 12 || !obj || typeof obj !== "object") return;
        for (const [key, val] of Object.entries(obj)) {
          if (typeof val === "string" && /https?:\/\/.+\.(jpg|jpeg|png|webp)/i.test(val)) {
            urls.add(val.split("?")[0].includes(".") ? val : val);
          }
          if (typeof val === "object" && val !== null) walkJson(val, depth + 1);
        }
      };
      walkJson(data);
    } catch { /* bad JSON */ }
  }

  // 2. Generic script blocks containing image CDN URLs (window.__data__, preloaded state, etc.)
  const scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = scriptRe.exec(html)) !== null) {
    const block = m[1];
    // Only scan blocks that look like they contain data (JSON-like or assignments)
    if (block.length < 200 || block.length > 500000) continue;
    if (!/photos\.|zillowstatic|rdcpix|rdc\.moveaws|mediaserver/i.test(block)) continue;
    let match;
    while ((match = imgUrlRe.exec(block)) !== null) {
      urls.add(match[0]);
    }
  }

  // 3. CDN-specific patterns anywhere in the HTML
  const cdnRe = /https?:\/\/(?:photos\.zillowstatic\.com|(?:photos|ap)\.(?:rdc\.moveaws|rdcpix)\.com|ssl\.cdn-redfin\.com|mediaserver\.resaas\.com)[^\s"'<>\\)]+/gi;
  while ((m = cdnRe.exec(html)) !== null) urls.add(m[0]);

  return [...urls];
}

function extractImagesFromHtml(html) {
  const urls = new Set();

  // og:image and twitter:image meta tags
  const metaRe = /<meta\s+[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/gi;
  let m;
  while ((m = metaRe.exec(html)) !== null) urls.add(m[1]);
  // Also match content before property/name
  const metaRe2 = /<meta\s+[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/gi;
  while ((m = metaRe2.exec(html)) !== null) urls.add(m[1]);

  // JSON-LD blocks
  const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = ldRe.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1]);
      const walk = (o) => {
        if (!o || typeof o !== "object") return;
        if (typeof o.image === "string") urls.add(o.image);
        if (Array.isArray(o.image)) o.image.forEach(i => typeof i === "string" && urls.add(i));
        if (Array.isArray(o["@graph"])) o["@graph"].forEach(walk);
        Object.values(o).forEach(v => { if (Array.isArray(v)) v.forEach(walk); });
      };
      walk(obj);
    } catch { /* bad JSON-LD */ }
  }

  // Merge with script-tag extraction (the main source for Zillow/Realtor)
  const scriptUrls = extractImagesFromScriptData(html);
  scriptUrls.forEach(u => urls.add(u));

  // Filter out logos/icons, deduplicate, limit to 8
  return [...urls]
    .filter(u => !/logo|icon|favicon|sprite|badge|avatar/i.test(u))
    .filter(u => /\.(jpg|jpeg|png|webp)/i.test(u) || /photos\./i.test(u))
    .slice(0, 8);
}

export async function scrapeListingUrl(url, apiKey, provider) {
  // Fetch the listing page HTML
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FlyrAI/1.0)" },
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  const html = await res.text();

  // Extract images from full HTML (before truncation)
  const images = extractImagesFromHtml(html);

  // Truncate to avoid token limits for AI extraction
  const trimmed = html.slice(0, 12000);

  const system = "You extract real estate listing data from HTML. Return ONLY valid JSON.";
  const prompt = `Extract property details from this listing page HTML. Return ONLY JSON with these fields:
{"address":"full address","price":489000,"beds":4,"baths":3,"sqft":"2,340","description":"Two compelling sentences about the property."}

HTML:
${trimmed}`;

  const text = await callAI(apiKey, provider, system, prompt, 500);
  const json = JSON.parse(text.replace(/```json|```/g, "").trim());

  // Transform image URLs to proxy URLs to avoid CDN hotlink blocking
  const proxiedImages = images.map(u => `/api/generate/image-proxy?url=${encodeURIComponent(u)}`);
  return { ...json, images: proxiedImages };
}
