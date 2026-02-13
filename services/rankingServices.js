/**
 * RankingService
 * ──────────────
 * Computes a composite ranking score for each candidate product
 * against a parsed query intent.
 *
 * Score components (total = 1.0):
 *  ┌─────────────────────────────────┬────────┐
 *  │ Component                       │ Weight │
 *  ├─────────────────────────────────┼────────┤
 *  │ Text Relevance                  │  0.30  │
 *  │ Quality (rating + trust)        │  0.22  │
 *  │ Popularity (sold + velocity)    │  0.18  │
 *  │ Stock / Availability            │  0.08  │
 *  │ Commercial (discount + price)   │  0.10  │
 *  │ Intent Bonus (cheap/new/etc.)   │  0.12  │
 *  └─────────────────────────────────┴────────┘
 *
 * All sub-scores are normalised to [0, 1] before weighting.
 */

const Fuse = require("fuse.js");

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const WEIGHTS = {
  textRelevance: 0.30,
  quality: 0.22,
  popularity: 0.18,
  stock: 0.08,
  commercial: 0.10,
  intentBonus: 0.12,
};

const CURRENT_YEAR = new Date().getFullYear();

// ──────────────────────────────────────────────
// Helper: clamp to [0, 1]
// ──────────────────────────────────────────────
const clamp = (v) => Math.max(0, Math.min(1, v));

// ──────────────────────────────────────────────
// Helper: log-normalise large numbers to [0,1]
// ──────────────────────────────────────────────
const logNorm = (v, base = 1000) => {
  if (!v || v <= 0) return 0;
  return clamp(Math.log1p(v) / Math.log1p(base));
};

// ──────────────────────────────────────────────
// 1. TEXT RELEVANCE
// ──────────────────────────────────────────────
/**
 * Computes text relevance using a combination of:
 *  - Fuse.js fuzzy score against title + brand + tags
 *  - Token-level overlap (how many query tokens appear in the product)
 */
function computeTextRelevance(product, parsedQuery, fuseScoreMap) {
  // Fuse score is in [0,1] where 0 = perfect. Invert it.
  const fuseScore = fuseScoreMap.has(product._id || product.id)
    ? 1 - (fuseScoreMap.get(product._id || product.id) || 0)
    : 0;

  // Token overlap ratio
  const haystack = [
    product.title || "",
    product.brand || "",
    product.description || "",
    ...(product.searchTags || []),
    product.model || "",
  ]
    .join(" ")
    .toLowerCase();

  const tokens = parsedQuery.tokens || [];
  const matchedTokens = tokens.filter((t) => haystack.includes(t)).length;
  const tokenOverlap = tokens.length > 0 ? matchedTokens / tokens.length : 0;

  // Title starts-with bonus
  const titleStartsWithBonus =
    product.title?.toLowerCase().startsWith(parsedQuery.tokens[0] || "") ? 0.15 : 0;

  return clamp(fuseScore * 0.6 + tokenOverlap * 0.35 + titleStartsWithBonus);
}

// ──────────────────────────────────────────────
// 2. QUALITY SCORE
// ──────────────────────────────────────────────
/**
 * Considers:
 *  - Rating (0-5)
 *  - Review count confidence (more reviews → more trustworthy rating)
 *  - Return rate (inverted)
 *  - Complaint rate (inverted)
 */
function computeQualityScore(product) {
  const rating = product.rating || 0;
  const reviews = product.reviewCount || 0;
  const returnRate = product.returnRate ?? 5;
  const complaintRate = product.complaintRate ?? 2;

  // Bayesian-style confidence adjustment:
  // rating_score = (C * m + rating * n) / (C + n)
  // where m = global mean (3.5), C = confidence prior (50 reviews)
  const GLOBAL_MEAN = 3.5;
  const CONFIDENCE_PRIOR = 50;
  const adjustedRating =
    (CONFIDENCE_PRIOR * GLOBAL_MEAN + rating * reviews) / (CONFIDENCE_PRIOR + reviews);
  const ratingScore = adjustedRating / 5;

  // Trust scores (lower rates → higher score)
  const returnScore = clamp(1 - returnRate / 100);
  const complaintScore = clamp(1 - complaintRate / 100);

  return clamp(ratingScore * 0.6 + returnScore * 0.25 + complaintScore * 0.15);
}

// ──────────────────────────────────────────────
// 3. POPULARITY SCORE
// ──────────────────────────────────────────────
/**
 * Log-normalises unitsSold and salesVelocity.
 * salesVelocity (last-30-day sales) weighted higher to reflect recency.
 */
function computePopularityScore(product) {
  const soldScore = logNorm(product.unitsSold || 0, 50000);
  const velocityScore = logNorm(product.salesVelocity || 0, 2000);
  const viewScore = logNorm(product.viewCount || 0, 100000);
  return clamp(soldScore * 0.5 + velocityScore * 0.35 + viewScore * 0.15);
}

// ──────────────────────────────────────────────
// 4. STOCK / AVAILABILITY SCORE
// ──────────────────────────────────────────────
function computeStockScore(product) {
  if (!product.stock || product.stock === 0) return 0;

  // Express fulfillment gets a bonus
  const fulfillmentBonus = product.fulfillmentType === "express" ? 0.15 : 0;

  // Stock level: 1-10 = low, 11-50 = medium, 51+ = good
  const stockLevel = product.stock >= 50 ? 1 : product.stock >= 10 ? 0.75 : 0.5;
  return clamp(stockLevel + fulfillmentBonus);
}

// ──────────────────────────────────────────────
// 5. COMMERCIAL SCORE
// ──────────────────────────────────────────────
/**
 * Higher discount → higher commercial score.
 * Also rewards products in-stock compared to MRP.
 */
function computeCommercialScore(product) {
  const discount = product.discountPercent || 0;
  // Log-scale: 5% discount gives ~0.4, 30% gives ~0.8, 60% gives ~1.0
  const discountScore = clamp(Math.log1p(discount) / Math.log1p(70));
  return discountScore;
}

// ──────────────────────────────────────────────
// 6. INTENT BONUS
// ──────────────────────────────────────────────
/**
 * Modifies score based on specific user intent:
 *  - cheap: boost discounted / low-price items
 *  - latest: boost newer models (by launchYear or title model number)
 *  - best: boost high-rated items
 *  - premium: boost flagship / high-price items
 *  - color/storage/ram match: exact attribute match bonus
 *  - priceRange: whether product falls in stated price range
 */
function computeIntentBonus(product, parsedQuery) {
  const { intent, color, storageGB, ramGB, maxPrice, minPrice, priceExplicit } = parsedQuery;
  let bonus = 0;

  if (intent.cheap) {
    // Reward high discount and low absolute price
    const discountBonus = clamp((product.discountPercent || 0) / 50);
    const priceBonus = product.price < 20000 ? 0.3 : product.price < 40000 ? 0.15 : 0;
    bonus += discountBonus * 0.5 + priceBonus * 0.5;
  }

  if (intent.latest) {
    const year = product.launchYear || 2020;
    const freshnessScore = clamp((year - 2018) / (CURRENT_YEAR - 2018));
    bonus += freshnessScore * 0.8;
    // Also check if model title has a higher model number
    const modelNum = parseInt((product.title || "").match(/\d+/)?.[0] || "0", 10);
    if (modelNum >= 15) bonus += 0.1;
    if (modelNum >= 16) bonus += 0.1;
  }

  if (intent.best) {
    const rating = product.rating || 0;
    bonus += clamp((rating - 3) / 2) * 0.9; // rating > 3 gets progressively more
  }

  if (intent.premium) {
    const price = product.price || 0;
    if (price > 80000) bonus += 0.6;
    else if (price > 50000) bonus += 0.3;
    else if (price > 30000) bonus += 0.1;
  }

  if (intent.moreStorage && storageGB) {
    const productStorage = parseInt(
      product.metadata?.storage || product.metadata?.get?.("storage") || "0",
      10
    );
    if (productStorage >= storageGB) bonus += 0.5;
  }

  // Color match
  if (color) {
    const title = (product.title || "").toLowerCase();
    const productColor = (product.color || "").toLowerCase();
    const meta = product.metadata;
    const metaColor =
      (typeof meta?.get === "function" ? meta.get("color") : meta?.color) || "";
    if (
      title.includes(color) ||
      productColor.includes(color) ||
      metaColor.toLowerCase().includes(color)
    ) {
      bonus += 0.6;
    }
  }

  // RAM match
  if (ramGB) {
    const meta = product.metadata;
    const productRam = parseInt(
      (typeof meta?.get === "function" ? meta.get("ram") : meta?.ram) || "0",
      10
    );
    if (productRam >= ramGB) bonus += 0.3;
  }

  // Price range match
  if (priceExplicit) {
    const price = product.price || 0;
    const inRange =
      (maxPrice ? price <= maxPrice : true) && (minPrice ? price >= minPrice : true);
    if (!inRange) bonus -= 0.8; // Heavy penalty for out-of-range products
    else bonus += 0.4;
  }

  return clamp(bonus);
}

// ──────────────────────────────────────────────
// Out-of-stock penalty
// ──────────────────────────────────────────────
function outOfStockPenalty(product) {
  return product.stock === 0 ? 0.5 : 1.0;
}

// ──────────────────────────────────────────────
// Public: build Fuse index for a product set
// ──────────────────────────────────────────────
function buildFuseIndex(products) {
  return new Fuse(products, {
    includeScore: true,
    threshold: parseFloat(process.env.FUZZY_MATCH_THRESHOLD || "0.45"),
    keys: [
      { name: "title", weight: 0.5 },
      { name: "brand", weight: 0.25 },
      { name: "searchTags", weight: 0.15 },
      { name: "description", weight: 0.05 },
      { name: "model", weight: 0.05 },
    ],
  });
}

// ──────────────────────────────────────────────
// Public: rank a list of candidate products
// ──────────────────────────────────────────────
/**
 * @param {Object[]} candidates  - array of product plain objects
 * @param {Object}   parsedQuery - output of queryParser.parseQuery()
 * @param {Map}      fuseScoreMap - productId → fuse score (0=perfect)
 * @returns {Object[]} sorted by descending finalScore, with score attached
 */
function rankProducts(candidates, parsedQuery, fuseScoreMap) {
  const scored = candidates.map((product) => {
    const textScore = computeTextRelevance(product, parsedQuery, fuseScoreMap);
    const qualityScore = computeQualityScore(product);
    const popularityScore = computePopularityScore(product);
    const stockScore = computeStockScore(product);
    const commercialScore = computeCommercialScore(product);
    const intentScore = computeIntentBonus(product, parsedQuery);

    const rawScore =
      textScore * WEIGHTS.textRelevance +
      qualityScore * WEIGHTS.quality +
      popularityScore * WEIGHTS.popularity +
      stockScore * WEIGHTS.stock +
      commercialScore * WEIGHTS.commercial +
      intentScore * WEIGHTS.intentBonus;

    // Apply out-of-stock penalty at the end
    const finalScore = rawScore * outOfStockPenalty(product);

    return {
      ...product,
      _scores: {
        text: +textScore.toFixed(3),
        quality: +qualityScore.toFixed(3),
        popularity: +popularityScore.toFixed(3),
        stock: +stockScore.toFixed(3),
        commercial: +commercialScore.toFixed(3),
        intent: +intentScore.toFixed(3),
        final: +finalScore.toFixed(4),
      },
    };
  });

  // Sort descending by final score
  scored.sort((a, b) => b._scores.final - a._scores.final);
  return scored;
}

module.exports = { rankProducts, buildFuseIndex };