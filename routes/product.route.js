const express = require("express");
const router = express.Router();
const {
  storeProduct,
  updateMetadata,
  getProduct,
  listProducts,
  updateProduct,
  removeProduct,
} = require("../controllers/product.controller");

/**
 * POST   /api/v1/product          — Create a product
 * GET    /api/v1/product          — List all products (paginated)
 * GET    /api/v1/product/:id      — Get single product
 * PATCH  /api/v1/product/:id      — Update product fields
 * DELETE /api/v1/product/:id      — Soft-delete product
 * PUT    /api/v1/product/meta-data — Update product metadata
 */

router.post("/", storeProduct);
router.get("/", listProducts);
router.put("/meta-data", updateMetadata);  // Must come before /:id
router.get("/:id", getProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", removeProduct);

module.exports = router;