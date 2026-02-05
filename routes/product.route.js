const express = require("express");
const productRouter = express.Router();
const {
  postProduct,
  updateProduct,
} = require("../controllers/product.controller");

// 1️⃣ Store Product in Catalog
productRouter.post("/product", postProduct);

// 2️⃣ Update Metadata
productRouter.put("/product/meta-data", updateProduct);

module.exports = productRouter;
