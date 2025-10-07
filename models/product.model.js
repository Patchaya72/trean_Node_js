const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  name: String,
  price: Number,
  stock: Number,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Product", productSchema);
