const express = require("express");
const router = express.Router();
const { searchProducts } = require("../controllers/search.controller");

/**
 * GET /api/v1/search/product?query=<term>
 *
 * Query params:
 *  query     (required) — search term
 *  page      (optional) — page number, default 1
 *  limit     (optional) — results per page, default 20, max 100
 *  category  (optional) — filter by category
 *  debug     (optional) — include scoring breakdown (true/false)
 */
router.get("/product", searchProducts);

module.exports = router;