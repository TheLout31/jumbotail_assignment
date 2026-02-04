const { chromium } = require("playwright");
const Product = require("../models/Product");
const generateMetrics = require("./generateMetrics");

async function scrapeAmazonProducts() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://www.amazon.in/s?k=iphone",
    { waitUntil: "domcontentloaded" }
  );

  // Wait for product cards
  await page.waitForSelector('[data-component-type="s-search-result"]');

  const products = await page.$$eval(
    '[data-component-type="s-search-result"]',
    cards => {
      return cards.slice(0, 100).map(card => {
        const title =
          card.querySelector("h2 span")?.innerText || "";

        const price =
          card.querySelector(".a-price-whole")?.innerText || "0";

        return {
          title,
          price: Number(price.replace(/,/g, "")),
        };
      });
    }
  );

  await browser.close();

  // Normalize into your Product model
  return products.map(p => new Product({
    title: p.title,
    price: p.price,
    mrp: p.price + 3000,
    stock: Math.floor(Math.random() * 50),
    description: `Amazon listing for ${p.title}`,
    rating: 4 + Math.random(),
    currency: "Rupee",
    metadata: {
      source: "amazon"
    },
    metrics: generateMetrics()
  }));
}

module.exports = scrapeAmazonProducts;
