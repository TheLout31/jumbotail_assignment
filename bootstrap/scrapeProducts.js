const axios = require("axios");
const Product = require("../models/Product");
const generateMetrics = require("./generateMetrics");

const BASE_URL = "https://dummyjson.com/products";
const LIMIT = 100;

async function scrapeProducts() {
  let allProducts = [];
  let skip = 0;

  while (allProducts.length < 1000) {
    const res = await axios.get(
      `${BASE_URL}?limit=${LIMIT}&skip=${skip}`
    );

    const fetchedProducts = res.data.products;

    // 🔥 IMPORTANT BREAK CONDITION
    if (!fetchedProducts || fetchedProducts.length === 0) {
      break;
    }

    const products = fetchedProducts.map(p => {
      return new Product({
        title: p.title,
        brand: p.brand,
        category: p.category,
        price: p.price,
        description: p.description,
        metadata: {
          screenSize: Math.random() > 0.5 ? 55 : 65,
          displayType: "LED",
          brightness: Math.floor(Math.random() * 500) + 300
        },
        metrics: generateMetrics()
      });
    });

    allProducts.push(...products);
    skip += LIMIT;
  }

  // 🔥 Duplicate products with variations to reach 1000
  const original = [...allProducts];
  while (allProducts.length < 1000) {
    original.forEach(p => {
      if (allProducts.length < 1000) {
        allProducts.push(
          new Product({
            ...p,
            price: p.price + Math.floor(Math.random() * 5000),
            metrics: generateMetrics()
          })
        );
      }
    });
  }

  return allProducts;
}

module.exports = scrapeProducts;
