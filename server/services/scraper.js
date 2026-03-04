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

// Extract basic property data from HTML meta tags and structured data without AI
function extractBasicDataFromHtml(html) {
  const data = { address: "", price: "", beds: "", baths: "", sqft: "", description: "" };

  // Try og:title for address
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  if (ogTitle) data.address = ogTitle[1].replace(/\s*[|\-–].+$/, "").trim();

  // Try og:description
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  if (ogDesc) data.description = ogDesc[1].trim();

  // Try JSON-LD for structured data
  const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRe.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1]);
      const items = obj["@graph"] || [obj];
      for (const item of items) {
        if (item["@type"] === "SingleFamilyResidence" || item["@type"] === "Product" || item["@type"] === "RealEstateListing") {
          if (item.name) data.address = data.address || item.name;
          if (item.description) data.description = data.description || item.description;
          const addr = item.address;
          if (addr && typeof addr === "object") {
            data.address = data.address || [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode].filter(Boolean).join(", ");
          }
        }
      }
    } catch { /* bad JSON-LD */ }
  }

  // Try to pull price from common patterns
  const priceMatch = html.match(/\$[\d,]+(?:\.\d{2})?/) || html.match(/"price"\s*:\s*"?\$?([\d,]+)/);
  if (priceMatch) data.price = priceMatch[0].replace(/[$,]/g, "");

  // Beds/baths from meta or text patterns
  const bedsMatch = html.match(/(\d+)\s*(?:bed|bd|bedroom)/i);
  if (bedsMatch) data.beds = bedsMatch[1];
  const bathsMatch = html.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)/i);
  if (bathsMatch) data.baths = bathsMatch[1];
  const sqftMatch = html.match(/([\d,]+)\s*(?:sq\s*ft|sqft|square\s*feet)/i);
  if (sqftMatch) data.sqft = sqftMatch[1];

  return data;
}

export async function scrapeListingUrl(url, apiKey, provider) {
  // Fetch the listing page HTML
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);
  const html = await res.text();

  // Extract images from full HTML (before truncation)
  const images = extractImagesFromHtml(html);

  let json;
  if (apiKey) {
    // Use AI for rich text extraction
    const trimmed = html.slice(0, 12000);
    const system = "You extract real estate listing data from HTML. Return ONLY valid JSON.";
    const prompt = `Extract property details from this listing page HTML. Return ONLY JSON with these fields:
{"address":"full address","price":489000,"beds":4,"baths":3,"sqft":"2,340","description":"Two compelling sentences about the property."}

HTML:
${trimmed}`;

    try {
      const text = await callAI(apiKey, provider, system, prompt, 500);
      json = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      // AI failed, fall back to basic extraction
      json = extractBasicDataFromHtml(html);
    }
  } else {
    // No API key — extract basic data from HTML meta/structured data
    json = extractBasicDataFromHtml(html);
  }

  // Transform image URLs to proxy URLs to avoid CDN hotlink blocking
  const proxiedImages = images.map(u => `/api/generate/image-proxy?url=${encodeURIComponent(u)}`);
  return { ...json, images: proxiedImages };
}
