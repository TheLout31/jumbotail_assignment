const mongoose = require("mongoose");

/**
 * Product Schema
 *
 * Captures everything needed for the ranking algorithm:
 *  - Core listing info  (title, description, price)
 *  - Quality signals    (rating, reviews, complaints, returnRate)
 *  - Popularity signals (unitsSold, salesVelocity, viewCount)
 *  - Inventory signals  (stock, fulfillmentType)
 *  - Rich metadata      (flexible key-value map per category)
 *  - Search helpers     (searchTags, brand, category, model)
 */
const productSchema = new mongoose.Schema(
  {
    // ── Core fields ──────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
      index: "text",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
      index: "text",
    },
    brand: {
      type: String,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Mobile Phones",
        "Laptops",
        "Headphones",
        "Earphones",
        "Smartwatches",
        "Tablets",
        "Phone Accessories",
        "Chargers & Cables",
        "Power Banks",
        "Gaming",
        "Networking",
        "Cameras",
        "Other Electronics",
      ],
      index: true,
    },
    model: { type: String, trim: true },

    // ── Pricing ───────────────────────────────────────────────
    price: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Price cannot be negative"],
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"],
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "Rupee", "USD"],
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // ── Inventory ─────────────────────────────────────────────
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    fulfillmentType: {
      type: String,
      enum: ["express", "standard", "seller_fulfilled"],
      default: "standard",
    },

    // ── Quality signals ───────────────────────────────────────
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    returnRate: {
      // percentage (0-100); lower is better
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    complaintRate: {
      // percentage (0-100); lower is better
      type: Number,
      default: 2,
      min: 0,
      max: 100,
    },

    // ── Popularity signals ────────────────────────────────────
    unitsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    salesVelocity: {
      // units sold in last 30 days
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Flexible metadata ─────────────────────────────────────
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ── Search helpers ────────────────────────────────────────
    searchTags: {
      type: [String],
      default: [],
      index: "text",
    },
    color: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    launchYear: { type: Number },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ──────────────────────────────────────────────
// Virtual: computed discount
// ──────────────────────────────────────────────
productSchema.virtual("computedDiscount").get(function () {
  if (this.mrp && this.mrp > 0) {
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  return 0;
});

// ──────────────────────────────────────────────
// Pre-save: auto-compute discountPercent & normalise currency
// ──────────────────────────────────────────────
productSchema.pre("save", function (next) {
  if (this.mrp && this.mrp > 0) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  if (this.currency === "Rupee") this.currency = "INR";
  next();
});

// ──────────────────────────────────────────────
// Compound text index for full-text search
// ──────────────────────────────────────────────
productSchema.index(
  { title: "text", description: "text", brand: "text", searchTags: "text" },
  {
    weights: { title: 10, brand: 8, searchTags: 6, description: 2 },
    name: "product_text_index",
  }
);

productSchema.index({ category: 1, rating: -1, unitsSold: -1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;