/**
 * ProductService
 * ──────────────
 * Data-access layer for products.
 * Transparently uses MongoDB when connected, or falls back to the
 * in-memory store if the database is unavailable.
 */

const Product = require("../models/Product");
const inMemoryStore = require("../store/inMemoryStore");




// ──────────────────────────────────────────────
// Mode detection
// ──────────────────────────────────────────────
const useDB = () => process.env.USE_IN_MEMORY !== "true";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
/** Converts a Mongoose doc or plain object to a clean response shape */
const toResponse = (doc) => {
  if (!doc) return null;
  const obj = typeof doc.toObject === "function" ? doc.toObject({ virtuals: true }) : doc;
  // Flatten metadata Map → plain object for JSON serialisation
  if (obj.metadata instanceof Map) {
    obj.metadata = Object.fromEntries(obj.metadata);
  }
  return obj;
};

// ──────────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────────
/**
 * Stores a new product.
 * Auto-computes discountPercent and builds searchTags if not supplied.
 */
const createProduct = async (data) => {
  // Auto-generate search tags from title + brand + model
  if (!data.searchTags || data.searchTags.length === 0) {
    const tagString = [data.title, data.brand, data.model, data.color, data.category]
      .filter(Boolean)
      .join(" ");
    data.searchTags = [
      ...new Set(
        tagString
          .toLowerCase()
          .split(/\s+/)
          .filter((t) => t.length > 2)
      ),
    ];
  }

  if (useDB()) {
    const product = new Product(data);
    await product.save();
    return toResponse(product);
  } else {
    return toResponse(inMemoryStore.create(data));
  }
};

// ──────────────────────────────────────────────
// READ ONE
// ──────────────────────────────────────────────
const getProductById = async (id) => {
  if (useDB()) {
    const product = await Product.findById(id);
    return toResponse(product);
  } else {
    return toResponse(inMemoryStore.findById(id));
  }
};

// ──────────────────────────────────────────────
// READ ALL (paginated)
// ──────────────────────────────────────────────
const getAllProducts = async ({ page = 1, limit = 20, category, brand } = {}) => {
  const skip = (page - 1) * limit;

  if (useDB()) {
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, "i");

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limit).lean({ virtuals: true }),
      Product.countDocuments(filter),
    ]);

    return {
      products: products.map(toResponse),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  } else {
    let all = inMemoryStore.findAll({ limit: 10000 });
    if (category) all = all.filter((p) => p.category === category);
    if (brand) all = all.filter((p) => (p.brand || "").match(new RegExp(brand, "i")));
    const total = all.length;
    const products = all.slice(skip, skip + limit);
    return {
      products: products.map(toResponse),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
};

// ──────────────────────────────────────────────
// UPDATE METADATA
// ──────────────────────────────────────────────
const updateProductMetadata = async (productId, metadata) => {
  if (useDB()) {
    const product = await Product.findById(productId);
    if (!product) return null;

    // Merge into existing metadata map
    Object.entries(metadata).forEach(([k, v]) => {
      product.metadata.set(k, v);
    });
    await product.save();
    return toResponse(product);
  } else {
    const updated = inMemoryStore.updateById(productId, { metadata });
    return toResponse(updated);
  }
};

// ──────────────────────────────────────────────
// UPDATE FULL PRODUCT
// ──────────────────────────────────────────────
const updateProduct = async (productId, updates) => {
  if (useDB()) {
    const product = await Product.findByIdAndUpdate(productId, updates, {
      new: true,
      runValidators: true,
    });
    return toResponse(product);
  } else {
    return toResponse(inMemoryStore.updateById(productId, updates));
  }
};

// ──────────────────────────────────────────────
// DELETE (soft delete)
// ──────────────────────────────────────────────
const deleteProduct = async (productId) => {
  if (useDB()) {
    const product = await Product.findByIdAndUpdate(
      productId,
      { isActive: false },
      { new: true }
    );
    return toResponse(product);
  } else {
    return inMemoryStore.updateById(productId, { isActive: false });
  }
};

// ──────────────────────────────────────────────
// CATALOG SIZE (for search service)
// ──────────────────────────────────────────────
const getCatalogCount = async () => {
  if (useDB()) return Product.countDocuments({ isActive: true });
  return inMemoryStore.count;
};

// ──────────────────────────────────────────────
// FETCH ALL FOR SEARCH (returns plain objects)
// ──────────────────────────────────────────────
const getAllForSearch = async () => {
  if (useDB()) {
    return Product.find({ isActive: true })
      .lean({ virtuals: true })
      .then((docs) => docs.map(toResponse));
  } else {
    return inMemoryStore.findAll({ limit: 1000000 }).map(toResponse);
  }
};

// ──────────────────────────────────────────────
// BULK INSERT (used by seed script)
// ──────────────────────────────────────────────
const bulkInsert = async (products) => {
  if (useDB()) {
    const docs = await Product.insertMany(products, { ordered: false });
    return docs.length;
  } else {
    const docs = inMemoryStore.bulkInsert(products);
    return docs.length;
  }
};

module.exports = {
  createProduct,
  getProductById,
  getAllProducts,
  updateProductMetadata,
  updateProduct,
  deleteProduct,
  getCatalogCount,
  getAllForSearch,
  bulkInsert,
};