let autoIncrementId = 100;
const products = [];

module.exports = {
  create(product) {
    autoIncrementId++;
    const newProduct = {
      productId: autoIncrementId,
      metadata: {},
      ...product
    };
    products.push(newProduct);
    return newProduct;
  },

  updateMetadata(productId, metadata) {
    const product = products.find(p => p.productId === productId);
    if (!product) return null;

    product.metadata = {
      ...product.metadata,
      ...metadata
    };
    return product;
  },

  getAll() {
    return products;
  }
};
