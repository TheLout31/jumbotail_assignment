const express = require("express");
const router = express.Router();

const productRoutes = require("./product.route");
const searchRoutes = require("./search.route");

// Mount sub-routers
router.use("/product", productRoutes);
router.use("/search", searchRoutes);

// Catalog stats
router.get("/catalog/stats", async (req, res, next) => {
  try {
    const productService = require("../services/productServices");
    const count = await productService.getCatalogCount();
    res.json({
      success: true,
      totalProducts: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;