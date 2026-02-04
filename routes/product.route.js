const express = require("express");
const productRouter = express.Router();
const productStore = require("../store/productStore");


// 1️⃣ Store Product in Catalog
productRouter.post("/product", (req, res) => {
  const {
    title,
    description,
    rating,
    stock,
    price,
    mrp,
    currency
  } = req.body;

  if (!title || !price || !mrp) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const product = productStore.create({
    title,
    description,
    rating,
    stock,
    price,
    mrp,
    currency
  });

  res.status(201).json({
    productId: product.productId
  });
});


// 2️⃣ Update Metadata
productRouter.put("/product/meta-data", (req, res) => {
  const { productId, Metadata } = req.body;

  const updatedProduct = productStore.updateMetadata(
    productId,
    Metadata
  );

  if (!updatedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json({
    productId: updatedProduct.productId,
    Metadata: updatedProduct.metadata
  });
});

module.exports = productRouter;
