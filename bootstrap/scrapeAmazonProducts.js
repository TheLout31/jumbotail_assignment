const { chromium } = require("playwright");
const Product = require("../models/Product");
const generateMetrics = require("./generateMetrics");

const MAX_PRODUCTS = 200;
const MAX_PAGES = 10;

async function scrapeAmazonProducts() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allProducts = [];
  const seenTitles = new Set();

  for (let pageNo = 1; pageNo <= MAX_PAGES; pageNo++) {
    console.log(`Scraping page ${pageNo}...`);

    await page.goto(
      `https://www.amazon.in/s?k=iphone&page=${pageNo}`,
      { waitUntil: "domcontentloaded", timeout: 60000 }
    );

    await page.waitForSelector('[data-component-type="s-search-result"]');

    const productsOnPage = await page.$$eval(
      '[data-component-type="s-search-result"]',
      cards =>
        cards.map(card => {
          const title =
            card.querySelector("h2 span")?.innerText?.trim() || null;

          const priceWhole =
            card.querySelector(".a-price-whole")?.innerText || null;

          if (!title || !priceWhole) return null;

          return {
            title,
            price: Number(priceWhole.replace(/,/g, ""))
          };
        }).filter(Boolean)
    );

    for (const p of productsOnPage) {
      if (!seenTitles.has(p.title)) {
        seenTitles.add(p.title);
        allProducts.push(p);
      }

      if (allProducts.length >= MAX_PRODUCTS) break;
    }

    if (allProducts.length >= MAX_PRODUCTS) break;
  }

  await browser.close();

  console.log(`Scraped ${allProducts.length} products`);

  // Normalize into Product model
  return allProducts.map(p =>
    new Product({
      title: p.title,
      price: p.price,
      mrp: p.price + 3000,
      stock: Math.floor(Math.random() * 50),
      description: `Amazon listing for ${p.title}`,
      rating: +(4 + Math.random()).toFixed(1),
      currency: "Rupee",
      metadata: {
        source: "amazon"
      },
      metrics: generateMetrics()
    })
  );
}

module.exports = scrapeAmazonProducts;
