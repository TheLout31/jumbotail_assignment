/**
 * SearchService
 * ─────────────
 * Orchestrates the full search pipeline:
 *  1. Query parsing    (Hinglish, spelling fix, intent/entity extraction)
 *  2. Candidate fetch  (MongoDB full-text search OR in-memory Fuse.js)
 *  3. Ranking          (composite score algorithm)
 *  4. Post-processing  (pagination, debug scores)
 */

const Product = require("../models/Product");
const inMemoryStore = require("../store/inMemoryStore");

const { parseQuery } = require("../utils/queryParser");
const { rankProducts, buildFuseIndex } = require("./rankingServices");

const MAX_RESULTS = parseInt(process.env.MAX_SEARCH_RESULTS || "100", 10);
const useDB = () => process.env.USE_IN_MEMORY !== "true";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const toPlain = (doc) => {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject({ virtuals: true }) : doc;
  if (obj.metadata instanceof Map) {
    obj.metadata = Object.fromEntries(obj.metadata);
  }
  return obj;
};

// ──────────────────────────────────────────────
// Phase 1: Candidate retrieval via MongoDB
// ──────────────────────────────────────────────
async function fetchCandidatesFromDB(parsedQuery, filterOpts) {
  const { normalised, tokens, brand, color, maxPrice, minPrice, storageGB } = parsedQuery;

  const filter = { isActive: true };

  // Price range
  if (maxPrice || minPrice) {
    filter.price = {};
    if (maxPrice) filter.price.$lte = maxPrice;
    if (minPrice) filter.price.$gte = minPrice;
  }

  // Category override from caller
  if (filterOpts.category) filter.category = filterOpts.category;

  // Brand exact-ish match
  if (brand) filter.brand = new RegExp(brand, "i");

  let candidates = [];
  console.log("Porduct details" , Product)
  // a) Full-text search
  if (normalised) {
    const textResults = await Product.find(
      { ...filter, $text: { $search: normalised } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(MAX_RESULTS * 2)
      .lean({ virtuals: true });

    candidates.push(...textResults);
  }

  // b) Regex fallback on title/brand (catches typo survivors + short queries)
  const regexTerms = tokens.map((t) => new RegExp(t, "i"));
  if (regexTerms.length) {
    const regexResults = await Product.find({
      ...filter,
      $or: [
        { title: { $in: regexTerms } },
        { brand: { $in: regexTerms } },
        { searchTags: { $in: regexTerms } },
      ],
    })
      .limit(MAX_RESULTS * 2)
      .lean({ virtuals: true });
    candidates.push(...regexResults);
  }

  // c) If nothing yet, fetch top products by category or brand
  if (candidates.length === 0) {
    candidates = await Product.find(filter)
      .sort({ rating: -1, unitsSold: -1 })
      .limit(MAX_RESULTS * 2)
      .lean({ virtuals: true });
  }

  // Deduplicate by _id
  const seen = new Set();
  return candidates
    .map(toPlain)
    .filter((p) => {
      const id = String(p._id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, MAX_RESULTS * 2);
}

// ──────────────────────────────────────────────
// Phase 1 (alt): Candidate retrieval via Fuse.js
// ──────────────────────────────────────────────
async function fetchCandidatesFromMemory(parsedQuery, filterOpts) {
  let allProducts = inMemoryStore.findAll({ limit: 1000000 }).map(toPlain);
console.log("All prduct details",allProducts)
  // Apply hard filters before fuzzy search
  if (filterOpts.category) {
    allProducts = allProducts.filter((p) => p.category === filterOpts.category);
  }
  if (parsedQuery.maxPrice) {
    allProducts = allProducts.filter((p) => p.price <= parsedQuery.maxPrice);
  }
  if (parsedQuery.minPrice) {
    allProducts = allProducts.filter((p) => p.price >= parsedQuery.minPrice);
  }

  const fuse = buildFuseIndex(allProducts);
  const results = fuse.search(parsedQuery.normalised || "", { limit: MAX_RESULTS * 2 });

  // If few results, supplement with full catalog (ranking will sort it out)
  let candidates;
  if (results.length < 20) {
    const fuseIds = new Set(results.map((r) => String(r.item._id)));
    const extra = allProducts.filter((p) => !fuseIds.has(String(p._id))).slice(0, MAX_RESULTS);
    candidates = [...results.map((r) => r.item), ...extra];
  } else {
    candidates = results.map((r) => r.item);
  }

  return { candidates, fuseResults: results };
}

// ──────────────────────────────────────────────
// Main search function
// ──────────────────────────────────────────────
/**
 * @param {string} rawQuery
 * @param {{ page?: number, limit?: number, category?: string, debug?: boolean }} opts
 */
async function search(rawQuery, opts = {}) {
  const { page = 1, limit = 20, category, debug = false } = opts;

  // 1. Parse query
  const parsedQuery = parseQuery(rawQuery);

  // 2. Retrieve candidates
  let candidates;
  let fuseScoreMap = new Map();

  if (useDB()) {
    candidates = await fetchCandidatesFromDB(parsedQuery, { category });
    // For DB mode, build a Fuse index on candidates for the relevance score
    const fuse = buildFuseIndex(candidates);
    const fuseResults = fuse.search(parsedQuery.normalised || "");
    fuseResults.forEach((r) => {
      const id = String(r.item._id);
      fuseScoreMap.set(id, r.score ?? 0);
    });
  } else {
    const { candidates: c, fuseResults } = await fetchCandidatesFromMemory(parsedQuery, {
      category,
    });
    candidates = c;
    fuseResults.forEach((r) => {
      const id = String(r.item._id);
      fuseScoreMap.set(id, r.score ?? 0);
    });
  }

  // 3. Rank candidates
  const ranked = rankProducts(candidates, parsedQuery, fuseScoreMap);

  // 4. Paginate
  const skip = (page - 1) * limit;
  const paginated = ranked.slice(skip, skip + limit);

  // 5. Shape response
  const data = paginated.map((p) => {
    const item = {
      productId: p._id || p.id,
      title: p.title,
      description: p.description,
      brand: p.brand,
      category: p.category,
      mrp: p.mrp,
      sellingPrice: p.price,
      discountPercent: p.discountPercent || 0,
      currency: p.currency || "INR",
      rating: p.rating,
      reviewCount: p.reviewCount,
      stock: p.stock,
      metadata: p.metadata,
      color: p.color,
      fulfillmentType: p.fulfillmentType,
    };
    if (debug) {
      item._scores = p._scores;
    }
    return item;
  });

  return {
    data,
    meta: {
      query: rawQuery,
      parsedQuery: debug ? parsedQuery : undefined,
      totalCandidates: ranked.length,
      page,
      limit,
      totalPages: Math.ceil(ranked.length / limit),
    },
  };
}

module.exports = { search };