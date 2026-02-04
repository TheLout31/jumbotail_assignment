const express = require("express");
const searchRouter = express.Router();
const productStore = require("../store/productStore");
const { calculateScore } = require("../services/rankingServices");

searchRouter.get("/search/product", (req, res) => {
  const rawQuery = req.query.query;
  console.log(rawQuery)
  if (!rawQuery || typeof rawQuery !== "string") {
    return res.status(400).json({ message: "Query required" });
  }
  
  const queryTokens = rawQuery
    .toLowerCase()
    .split(" ")
    .map(t => t.trim())
    .filter(Boolean); // 🔥 removes empty tokens

  const rankedProducts = productStore
    .getAll()
    .map(product => ({
      ...product,
      score: calculateScore(product, queryTokens)
    }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(p => ({
      productId: p.productId,
      title: p.title || p.name,
      description: p.description,
      mrp: p.mrp,
      Sellingprice: p.price,
      Metadata: p.metadata,
      stock: p.stock
    }));

  res.json({ data: rankedProducts });
});


module.exports = searchRouter;
