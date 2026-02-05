const crypto = require("crypto");

class Product {
  constructor({
    title,
    brand,
    category,
    price,
    description,
    metadata,
    metrics
  }) {
    this.id = crypto.randomUUID(); 
    this.title = title;
    this.brand = brand;
    this.category = category;
    this.price = price;
    this.description = description;
    this.metadata = metadata || {};
    this.metrics = metrics || {};
  }
}

module.exports = Product;
