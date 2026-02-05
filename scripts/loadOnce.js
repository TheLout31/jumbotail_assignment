const fs = require("fs");
const scrapeAmazonProducts = require("../bootstrap/scrapeAmazonProducts");

(async () => {
  const products = await scrapeAmazonProducts();
  fs.writeFileSync(
    "data/products.json",
    JSON.stringify(products, null, 2)
  );
  console.log("Saved", products.length, "products");
})();
