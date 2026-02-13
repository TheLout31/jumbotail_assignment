/**
 * QueryParser
 * ───────────
 * Normalises raw user queries into a structured intent object.
 *
 * Handles:
 *  - Hinglish keywords (sasta, naya, best, etc.)
 *  - Common spelling mistakes (ifone → iphone, samsng → samsung)
 *  - Intent extraction (cheap | latest | premium | colorMatch | storageMatch)
 *  - Entity extraction (brand, model, color, storage, price cap)
 */

// ──────────────────────────────────────────────────────────────
// Hinglish / colloquial → English mapping
// ──────────────────────────────────────────────────────────────
const HINGLISH_MAP = {
  // Price-related
  sasta: "cheap",
  sastha: "cheap",
  "sasta wala": "cheap",
  "saste mein": "cheap",
  "kam daam": "cheap",
  "low price": "cheap",
  mahenga: "premium",
  "best deal": "cheap",
  // Newness-related
  naya: "latest",
  "naya wala": "latest",
  latest: "latest",
  nayi: "latest",
  new: "latest",
  // Quality-related
  best: "best",
  badiya: "best",
  achha: "best",
  top: "best",
  // Storage
  "jyada storage": "more storage",
  "zyada storage": "more storage",
  "zyada memory": "more storage",
  // Durability
  "strong cover": "strong",
  "tough cover": "strong",
  "tanki": "strong",
  // Colors (Hindi)
  laal: "red",
  neela: "blue",
  safed: "white",
  kala: "black",
  peela: "yellow",
  hara: "green",
  narangi: "orange",
  sunhara: "gold",
};

// ──────────────────────────────────────────────────────────────
// Common misspellings → canonical brand/term
// ──────────────────────────────────────────────────────────────
const SPELLING_MAP = {
  ifone: "iphone",
  iphone: "iphone",
  "i phone": "iphone",
  iphon: "iphone",
  ipone: "iphone",
  aifon: "iphone",
  samsng: "samsung",
  samsun: "samsung",
  samung: "samsung",
  samasung: "samsung",
  samsumg: "samsung",
  oneplus: "oneplus",
  "one plus": "oneplus",
  "1 plus": "oneplus",
  realmi: "realme",
  realmee: "realme",
  "real me": "realme",
  redme: "redmi",
  "red mi": "redmi",
  "xaomi": "xiaomi",
  "xiomi": "xiaomi",
  soni: "sony",
  jbl: "jbl",
  boat: "boat",
  lenovo: "lenovo",
  lenova: "lenovo",
  lenovoo: "lenovo",
  macbook: "macbook",
  "mac book": "macbook",
  dell: "dell",
  deil: "dell",
};

// ──────────────────────────────────────────────────────────────
// Color keywords
// ──────────────────────────────────────────────────────────────
const COLOR_KEYWORDS = [
  "red", "blue", "black", "white", "gold", "silver", "green",
  "yellow", "purple", "pink", "orange", "grey", "gray",
  "midnight", "starlight", "titanium", "graphite", "coral", "lavender",
];

// ──────────────────────────────────────────────────────────────
// Storage size patterns  (e.g. "128gb", "256 gb", "1tb")
// ──────────────────────────────────────────────────────────────
const STORAGE_PATTERN = /(\d+)\s*(gb|tb|mb)/i;

// ──────────────────────────────────────────────────────────────
// RAM patterns  (e.g. "8gb ram", "12 gb ram")
// ──────────────────────────────────────────────────────────────
const RAM_PATTERN = /(\d+)\s*(gb|mb)\s*ram/i;

// ──────────────────────────────────────────────────────────────
// Price patterns  (e.g. "under 50000", "50k", "₹20000")
// ──────────────────────────────────────────────────────────────
const PRICE_PATTERN = /(?:under|below|less than|upto|up to|within)?\s*[₹]?\s*(\d+)\s*k?\s*(?:rupee|rs|inr)?/i;
const PRICE_K_PATTERN = /(\d+)\s*k\b/i; // "50k" → 50000

// ──────────────────────────────────────────────────────────────
// Known brands
// ──────────────────────────────────────────────────────────────
const BRANDS = [
  "apple", "iphone", "samsung", "oneplus", "realme", "redmi", "xiaomi",
  "poco", "vivo", "oppo", "motorola", "nokia", "asus", "rog",
  "dell", "hp", "lenovo", "acer", "msi", "macbook",
  "sony", "jbl", "boat", "noise", "sennheiser", "bose", "audio-technica",
  "boAt", "ptron", "zebronics",
];

// ──────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────

/**
 * Parses a raw query string and returns a structured intent object.
 *
 * @param {string} rawQuery
 * @returns {{
 *   normalised: string,
 *   tokens: string[],
 *   intent: { cheap: boolean, latest: boolean, best: boolean, premium: boolean, moreStorage: boolean, strong: boolean },
 *   brand: string|null,
 *   color: string|null,
 *   storageGB: number|null,
 *   ramGB: number|null,
 *   maxPrice: number|null,
 *   minPrice: number|null,
 *   priceExplicit: boolean
 * }}
 */
function parseQuery(rawQuery) {
  let q = (rawQuery || "").toLowerCase().trim();

  // 1. Apply Hinglish substitutions (longest match first)
  const hinglishKeys = Object.keys(HINGLISH_MAP).sort((a, b) => b.length - a.length);
  for (const k of hinglishKeys) {
    if (q.includes(k)) {
      q = q.replace(new RegExp(k, "gi"), HINGLISH_MAP[k]);
    }
  }

  // 2. Apply spelling corrections
  const spellingKeys = Object.keys(SPELLING_MAP).sort((a, b) => b.length - a.length);
  for (const k of spellingKeys) {
    if (q.includes(k)) {
      q = q.replace(new RegExp(`\\b${k}\\b`, "gi"), SPELLING_MAP[k]);
    }
  }

  const normalised = q.trim();

  // 3. Extract intent flags
  const intent = {
    cheap: /\bcheap\b/.test(q) || /budget/i.test(q),
    latest: /\b(latest|new|newest|recent)\b/.test(q),
    best: /\bbest\b/.test(q),
    premium: /\b(premium|flagship|pro|ultra|mahenga)\b/.test(q),
    moreStorage: /\b(more storage|more memory|high storage|large storage)\b/.test(q),
    strong: /\b(strong|tough|rugged|durable)\b/.test(q),
  };

  // 4. Extract brand
  let brand = null;
  for (const b of BRANDS) {
    if (q.includes(b.toLowerCase())) {
      brand = b;
      break;
    }
  }

  // 5. Extract color
  let color = null;
  for (const c of COLOR_KEYWORDS) {
    if (q.includes(c)) {
      color = c;
      break;
    }
  }

  // 6. Extract storage
  let storageGB = null;
  const storageMatch = STORAGE_PATTERN.exec(q);
  if (storageMatch) {
    const val = parseInt(storageMatch[1], 10);
    storageGB = storageMatch[2].toLowerCase() === "tb" ? val * 1024 : val;
  } else if (intent.moreStorage) {
    storageGB = 256; // default "more storage" threshold
  }

  // 7. Extract RAM
  let ramGB = null;
  const ramMatch = RAM_PATTERN.exec(q);
  if (ramMatch) ramGB = parseInt(ramMatch[1], 10);

  // 8. Extract price constraints
  let maxPrice = null;
  let minPrice = null;
  let priceExplicit = false;

  // "50k rupees" or "50k"
  const kMatch = PRICE_K_PATTERN.exec(q);
  if (kMatch) {
    const val = parseInt(kMatch[1], 10) * 1000;
    // Decide if it's a "max price" or "target price" heuristic
    if (/under|below|less|upto|within/.test(q)) {
      maxPrice = val;
    } else {
      // Treat as approximate: ±30%
      minPrice = Math.round(val * 0.7);
      maxPrice = Math.round(val * 1.3);
    }
    priceExplicit = true;
  }

  const priceMatch = PRICE_PATTERN.exec(q);
  if (priceMatch && !kMatch) {
    const val = parseInt(priceMatch[1], 10);
    if (val > 100) {
      // Likely a real price (ignore "16" from "iPhone 16")
      if (/under|below|less|upto|within/.test(q)) {
        maxPrice = val;
      } else {
        minPrice = Math.round(val * 0.7);
        maxPrice = Math.round(val * 1.3);
      }
      priceExplicit = true;
    }
  }

  // 9. Tokenise normalised query (remove stopwords)
  const STOPWORDS = new Set(["the", "a", "an", "and", "or", "for", "with", "in", "of", "at", "to", "on"]);
  const tokens = normalised
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

  return {
    normalised,
    tokens,
    intent,
    brand,
    color,
    storageGB,
    ramGB,
    maxPrice,
    minPrice,
    priceExplicit,
  };
}

module.exports = { parseQuery };