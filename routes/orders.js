var express = require("express");
var router = express.Router();

var Order = require("../models/order");
var Products = require("../models/product.model");
var { sendResponse } = require('../utils/responseHandler');

router.get("/", async function (req, res, next) {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products", "name price");
    return sendResponse(res, 200, "orders retrieved successfully",orders);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Server Error");
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    const orderId = req.params.id;
    // Find the order first
    const order = await Order.findById(orderId);
    if (!order) {
       return sendResponse(res, 404, "Order not found");
    }

    // Ensure there's at least one product in the order
    if (!order.products || order.products.length === 0) {
      // Still delete the order to keep DB consistent
      await Order.findByIdAndDelete(orderId);
      return sendResponse(res, 200, "Order deleted (no products to refund");
    }

    const productId = order.products[0];
    const qty = parseInt(order.quantity, 10) || 1;

    // Refund stock by incrementing product.stock (no need to check current stock)
    const product = await Products.findByIdAndUpdate(
      productId,
      { $inc: { stock: qty } },
      { new: true }
    );

    if (!product) {
      return sendResponse(res, 404, "Product not found to refund stock");
    }

    await Order.findByIdAndDelete(orderId);
    return sendResponse(res, 200, "Order deleted successfully and stock refunded");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Server Error");
  }
});

module.exports = router;
