const express = require("express");
const searchRouter = express.Router();
const { calculateScore } = require("../services/rankingServices");
const fuzzySearchProducts = require("../services/fuzzySearch");

searchRouter.get("/search/product", (req, res) => {
  const rawQuery = req.query.query;

  if (!rawQuery) {
    return res.status(400).json({ message: "Query required" });
  }

  const queryTokens = rawQuery
    .toLowerCase()
    .split(" ")
    .filter(Boolean);

  // 🔥 Fuzzy search first
  const fuzzyResults = fuzzySearchProducts(rawQuery);

  const rankedResults = fuzzyResults
    .map(({ product, fuzzyScore }) => {
      const rankingScore = calculateScore(product, queryTokens);

      return {
        ...product,
        finalScore: rankingScore + fuzzyScore * 50 // weight fuzzy relevance
      };
    })
    .filter(p => p.finalScore > 0)
    .sort((a, b) => b.finalScore - a.finalScore)
    .map(p => ({
      productId: p.productId,
      title: p.title,
      description: p.description,
      mrp: p.mrp ?? p.price,
      Sellingprice: p.price,
      Metadata: p.metadata,
      stock: p.stock ?? 1
    }));

  res.json({ data: rankedResults });
});


module.exports = searchRouter;
