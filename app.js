const express = require("express");
const scrapeProducts = require("./bootstrap/scrapeProducts");
const productStore = require("./store/productStore");
const productRouter = require("./routes/product.route");
const searchRouter = require("./routes/search.route");
const scrapeAmazonProducts = require("./bootstrap/scrapeAmazonProducts");
const app = express();

app.use(express.json());

app.use("/api/v1", productRouter);
app.use("/api/v1", searchRouter);

async function init() {
  try {
    console.log("Bootstrapping products...");

    const products = await scrapeAmazonProducts();

    if (!products || !products.length) {
      throw new Error("No products returned from scraper");
    }
    products.forEach((product) => {
      productStore.create(product);
    });
    // let dummy = productStore.getAll();
    console.log(products);
    console.log(`Loaded ${products.length} products`);
  } catch (error) {
    console.error("❌ Bootstrap failed:", error.message);
  }
}

init();

module.exports = app;
