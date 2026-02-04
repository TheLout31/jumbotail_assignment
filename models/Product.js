const { v4: uuidv4 } = require("uuid");

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
    this.id = uuidv4();
    this.title = title;
    this.brand = brand;
    this.category = category;
    this.price = price;

    this.description = description;

    this.metadata = metadata || {};

    this.metrics = metrics;
  }
}

module.exports = Product;
