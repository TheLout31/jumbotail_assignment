const express = require("express");
const productStore = require("./store/productStore");
const productRouter = require("./routes/product.route");
const searchRouter = require("./routes/search.route");

const app = express();
app.use(express.json());

app.use("/api/v1", productRouter);
app.use("/api/v1", searchRouter);

app.get("/", (req, res) => {
  res.json({ message: "Server working fine!!" });
});

// 🔥 BOOTSTRAP FROM JSON
function init() {
  try {
    console.log("📦 Loading products from JSON...");

    const products = require("./data/products.json");

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("products.json is empty or invalid");
    }

    products.forEach(product => {
      productStore.create(product);
    });

    console.log(`✅ Loaded ${products.length} products into memory`);
  } catch (error) {
    console.error("❌ Bootstrap failed:", error.message);
  }
}

init();

module.exports = app;
