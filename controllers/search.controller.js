/**
 * SearchController
 * ────────────────
 * Handles HTTP layer for the product search endpoint.
 */

const {search} = require("../services/searchServices");

// ──────────────────────────────────────────────
// GET /api/v1/search/product?query=...
// ──────────────────────────────────────────────
const searchProducts = async (req, res, next) => {
  try {
    const query = (req.query.query || req.query.q || "").trim();
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const category = req.query.category;
    const debug = req.query.debug === "true";

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required. Use ?query=<your search term>",
      });
    }

    const startTime = Date.now();
    const result = await search(query, { page, limit, category, debug });
    const latencyMs = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      latencyMs,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchProducts };