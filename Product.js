const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  sizes: [String],
  fabric: String,
  delivery: String,
  description: String,

  mediaUrl: String,
  mediaType: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Product", productSchema);