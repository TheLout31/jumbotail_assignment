const mongoose = require("mongoose");
require("dotenv").config();
/**
 * Establishes a connection to MongoDB.
 * Falls back gracefully if MongoDB is unavailable — the app can still
 * work in in-memory mode (products loaded from seed into process memory).
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI ;
  console.log()
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅  MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`⚠️   MongoDB connection failed: ${err.message}`);
    console.warn("    Falling back to in-memory store.\n");
    // Signal to services that DB is unavailable
    process.env.USE_IN_MEMORY = "true";
  }
};

module.exports = connectDB;