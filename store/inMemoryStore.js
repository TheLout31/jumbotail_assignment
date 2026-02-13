/**
 * InMemoryStore
 * ─────────────
 * A simple in-memory product catalog used when MongoDB is not available.
 * Exposes the same interface as Mongoose operations so services remain
 * agnostic of the underlying data store.
 */

const { v4: uuidv4 } = require("uuid");

class InMemoryStore {
  constructor() {
    /** @type {Map<string, Object>} */
    this._products = new Map();
    this._idCounter = 1;
  }

  // ── Helpers ────────────────────────────────────────────────
  _computeDiscount(price, mrp) {
    if (mrp && mrp > 0) return Math.round(((mrp - price) / mrp) * 100);
    return 0;
  }

  _toDoc(raw) {
    return {
      ...raw,
      id: raw._id,
      computedDiscount: this._computeDiscount(raw.price, raw.mrp),
    };
  }

  // ── CRUD ───────────────────────────────────────────────────

  /** Insert a new product; returns the saved doc */
  create(data) {
    const _id = String(this._idCounter++);
    const now = new Date().toISOString();
    const doc = {
      _id,
      title: data.title || "",
      description: data.description || "",
      brand: data.brand || "",
      category: data.category || "Other Electronics",
      model: data.model || "",
      price: data.price || 0,
      mrp: data.mrp || data.price || 0,
      currency: data.currency === "Rupee" ? "INR" : data.currency || "INR",
      discountPercent: this._computeDiscount(data.price, data.mrp),
      stock: data.stock ?? 0,
      fulfillmentType: data.fulfillmentType || "standard",
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
      returnRate: data.returnRate ?? 5,
      complaintRate: data.complaintRate ?? 2,
      unitsSold: data.unitsSold || 0,
      salesVelocity: data.salesVelocity || 0,
      viewCount: data.viewCount || 0,
      metadata: data.metadata || {},
      searchTags: data.searchTags || [],
      color: data.color || "",
      isActive: data.isActive !== undefined ? data.isActive : true,
      launchYear: data.launchYear || null,
      createdAt: now,
      updatedAt: now,
    };
    this._products.set(_id, doc);
    return this._toDoc(doc);
  }

  /** Retrieve by id */
  findById(id) {
    const doc = this._products.get(String(id));
    return doc ? this._toDoc(doc) : null;
  }

  /** Retrieve all active products */
  findAll({ limit = 1000, skip = 0 } = {}) {
    const all = [...this._products.values()]
      .filter((p) => p.isActive)
      .slice(skip, skip + limit);
    return all.map(this._toDoc.bind(this));
  }

  /** Retrieve all (for search — caller applies own filter) */
  findAllRaw() {
    return [...this._products.values()];
  }

  /** Update a product by id; returns updated doc or null */
  updateById(id, updates) {
    const doc = this._products.get(String(id));
    if (!doc) return null;
    const updated = { ...doc, ...updates, _id: doc._id, updatedAt: new Date().toISOString() };
    if (updates.metadata) {
      updated.metadata = { ...(doc.metadata || {}), ...(updates.metadata || {}) };
    }
    updated.discountPercent = this._computeDiscount(updated.price, updated.mrp);
    this._products.set(String(id), updated);
    return this._toDoc(updated);
  }

  /** Delete by id */
  deleteById(id) {
    return this._products.delete(String(id));
  }

  /** Number of products */
  get count() {
    return this._products.size;
  }

  /** Bulk insert (used by seed script) */
  bulkInsert(items) {
    return items.map((item) => this.create(item));
  }
}

// Singleton
const inMemoryStore = new InMemoryStore();
module.exports = inMemoryStore;