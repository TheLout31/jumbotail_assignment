/**
 * ProductController
 * ─────────────────
 * Handles HTTP request/response for product management.
 * Delegates business logic to ProductService.
 */

const Joi = require("joi");
const productService = require("../services/productServices");

// ──────────────────────────────────────────────
// Validation schemas
// ──────────────────────────────────────────────
const CATEGORIES = [
  "Mobile Phones", "Laptops", "Headphones", "Earphones", "Smartwatches",
  "Tablets", "Phone Accessories", "Chargers & Cables", "Power Banks",
  "Gaming", "Networking", "Cameras", "Other Electronics",
];

const createProductSchema = Joi.object({
  title: Joi.string().max(300).required(),
  description: Joi.string().max(5000).optional().allow(""),
  brand: Joi.string().max(100).optional().allow(""),
  category: Joi.string().valid(...CATEGORIES).optional().default("Other Electronics"),
  model: Joi.string().max(100).optional().allow(""),
  price: Joi.number().min(0).required(),
  mrp: Joi.number().min(0).required(),
  currency: Joi.string().valid("INR", "Rupee", "USD").optional().default("INR"),
  stock: Joi.number().min(0).optional().default(0),
  fulfillmentType: Joi.string().valid("express", "standard", "seller_fulfilled").optional(),
  rating: Joi.number().min(0).max(5).optional().default(0),
  reviewCount: Joi.number().min(0).optional().default(0),
  returnRate: Joi.number().min(0).max(100).optional().default(5),
  complaintRate: Joi.number().min(0).max(100).optional().default(2),
  unitsSold: Joi.number().min(0).optional().default(0),
  salesVelocity: Joi.number().min(0).optional().default(0),
  viewCount: Joi.number().min(0).optional().default(0),
  color: Joi.string().max(50).optional().allow(""),
  searchTags: Joi.array().items(Joi.string()).optional().default([]),
  launchYear: Joi.number().min(2000).max(2100).optional(),
  metadata: Joi.object().optional().default({}),
});

const updateMetadataSchema = Joi.object({
  productId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  metadata: Joi.object().required(),
});

const updateProductSchema = Joi.object({
  title: Joi.string().max(300).optional(),
  description: Joi.string().max(5000).optional().allow(""),
  brand: Joi.string().max(100).optional().allow(""),
  category: Joi.string().valid(...CATEGORIES).optional(),
  price: Joi.number().min(0).optional(),
  mrp: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  reviewCount: Joi.number().min(0).optional(),
  returnRate: Joi.number().min(0).max(100).optional(),
  complaintRate: Joi.number().min(0).max(100).optional(),
  unitsSold: Joi.number().min(0).optional(),
  salesVelocity: Joi.number().min(0).optional(),
  viewCount: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

// ──────────────────────────────────────────────
// POST /api/v1/product
// ──────────────────────────────────────────────
const storeProduct = async (req, res, next) => {
  try {
    const { error, value } = createProductSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }

    const product = await productService.createProduct(value);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      productId: product._id || product.id,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────
// PUT /api/v1/product/meta-data
// ──────────────────────────────────────────────
const updateMetadata = async (req, res, next) => {
  try {
    const { error, value } = updateMetadataSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }

    const { productId, metadata } = value;
    const product = await productService.updateProductMetadata(productId, metadata);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with id ${productId} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Metadata updated successfully",
      productId: product._id || product.id,
      metadata: product.metadata,
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────
// GET /api/v1/product/:id
// ──────────────────────────────────────────────
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with id ${id} not found`,
      });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────
// GET /api/v1/product
// ──────────────────────────────────────────────
const listProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const { category, brand } = req.query;

    const result = await productService.getAllProducts({ page, limit, category, brand });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────
// PATCH /api/v1/product/:id
// ──────────────────────────────────────────────
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateProductSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }

    const product = await productService.updateProduct(id, value);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with id ${id} not found`,
      });
    }
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────────
// DELETE /api/v1/product/:id
// ──────────────────────────────────────────────
const removeProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.deleteProduct(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with id ${id} not found`,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Product removed from catalog",
      productId: id,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  storeProduct,
  updateMetadata,
  getProduct,
  listProducts,
  updateProduct,
  removeProduct,
};