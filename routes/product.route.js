const express = require("express");
const productRouter = express.Router();
const productStore = require("../store/productStore");


// 1️⃣ Store Product in Catalog
productRouter.post("/product", (req, res) => {
  const {
    title,
    description,
    price,
    mrp,
    stock = 0,
    brand,
    category
  } = req.body;

  if (!title || !price) {
    return res.status(400).json({ message: "title and price are required" });
  }

  const product = productStore.create({
    title,
    description,
    price,
    mrp: mrp ?? price,
    stock,
    brand,
    category,
    source: "manual"
  });

  res.status(201).json({
    productId: product.productId
  });
});



// 2️⃣ Update Metadata
productRouter.put("/product/meta-data", (req, res) => {
  const { productId, metadata, stock, mrp } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "productId required" });
  }

  const updatedProduct = productStore.updateProduct(productId, {
    metadata,
    stock,
    mrp
  });

  if (!updatedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json({
    productId: updatedProduct.productId,
    metadata: updatedProduct.metadata,
    stock: updatedProduct.stock,
    mrp: updatedProduct.mrp
  });
});


module.exports = productRouter;
