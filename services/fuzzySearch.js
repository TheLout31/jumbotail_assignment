const Fuse = require("fuse.js");
const productStore = require("../store/productStore");

function fuzzySearchProducts(query) {
  const products = productStore.getAll();

  const fuse = new Fuse(products, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "description", weight: 0.3 },
      { name: "brand", weight: 0.1 }
    ],
    threshold: 0.4,        // typo tolerance (lower = stricter)
    distance: 100,
    includeScore: true,
    ignoreLocation: true
  });

  return fuse.search(query).map(result => ({
    product: result.item,
    fuzzyScore: 1 - result.score // normalize (higher is better)
  }));
}

module.exports = fuzzySearchProducts;
