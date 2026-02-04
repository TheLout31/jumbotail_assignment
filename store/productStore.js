let autoIncrementId = 100;
const products = [];

module.exports = {
  create(product) {
    autoIncrementId++;
    const newProduct = {
      productId: autoIncrementId,
      metadata: {},
      stock: 0,
      mrp: product.price,
      ...product
    };
    products.push(newProduct);
    return newProduct;
  },

  updateProduct(productId, updates) {
    const product = products.find(p => p.productId === productId);
    if (!product) return null;

    if (updates.metadata) {
      product.metadata = {
        ...product.metadata,
        ...updates.metadata
      };
    }

    if (updates.stock !== undefined) {
      product.stock = updates.stock;
    }

    if (updates.mrp !== undefined) {
      product.mrp = updates.mrp;
    }

    return product;
  },

  getAll() {
    return products;
  }
};
