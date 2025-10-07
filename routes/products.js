var express = require('express');
var router = express.Router();
var Products = require('../models/product.model');
var Order = require('../models/order');
var { sendResponse } = require('../utils/responseHandler');

/* GET products list */
router.get('/', async function (req, res, next) {
  try {
    const products = await Products.find();
    return sendResponse(res, 200, "products retrieved successfully",products);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Server Error");
  }
});

/* GET product by id */
router.get('/:id', async function (req, res, next) {
  try {
    const productId = req.params.id;
    const product = await Products.findById(productId);
    if (!product) {
        return sendResponse(res, 200, "Product not found",null);
    }
    return sendResponse(res, 200, "product retrieved successfully",product);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Server Error");
  }
});

router.get('/:id/orders', async function (req, res, next) {
  try {
    const orderId = req.params.id;
    const orders = await Order.find({ products: orderId }).populate('user', 'name email').populate('products', 'name price');
    if (orders.length === 0) {
        return sendResponse(res, 200, "Product not found",null);
    }
    return sendResponse(res, 200, "orders retrieved successfully",orders);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Server Error");
  }
});


router.post('/:id/orders', async function (req, res, next) {
  try {
    const productId = req.params.id;
    const { userId } = req.body;
    let { quantity } = req.body;

    // Basic validation
    const qty = parseInt(quantity, 10) || 1;
    if (!userId === undefined) {
      return sendResponse(res, 400, 'userId and totalAmount are required');
    }
    if (qty <= 0) {
      return sendResponse(res, 400, 'quantity must be at least 1');
    }

    // Atomically check stock and decrement if enough stock exists
    const product = await Products.findOneAndUpdate(
      { _id: productId, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );

    if (!product) {
      return sendResponse(res, 400, 'Product not found or insufficient stock');
    }

    // Create order with the quantity
    const order = new Order({
      user: userId,
      products: [productId],
      quantity: qty,
      totalPrice: product.price * qty,
      status: 'Pending',
    });

    try {
      await order.save();
      return sendResponse(res, 201, 'Order placed successfully',order);
    } catch (saveErr) {
      // Rollback stock decrement if order save failed
      console.error('Order save failed, rolling back stock decrement', saveErr);
      await Products.findByIdAndUpdate(productId, { $inc: { stock: qty } });
      return sendResponse(res, 500, 'Failed to place order');
    }
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Server Error");
  }
});

/* Create a new product */
router.post('/', async function (req, res, next) {
  try {
    const { name, price, stock } = req.body;
    let existing = await Products.findOne({ name });
    if (existing) {
      return sendResponse(res, 400, 'Product already exists');
    }

    const product = new Products({
      name,
      price,
      stock,
    });

    await product.save();
    return sendResponse(res, 201, 'Product added successfully');
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "Server Error");
  }
});

/* Update product */
router.put('/:id', async function (req, res, next) {
  try {
    const productId = req.params.id;
    const updatedProduct = await Products.findByIdAndUpdate(
      productId,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return sendResponse(res, 404, "Product not found");
    }
    return sendResponse(res, 200, "updatedProduct successfully",updatedProduct);
  } catch (error) {
    console.error(error);
   return sendResponse(res, 500, "Server Error");
  }
});

/* Delete product */
router.delete('/:id', async function (req, res, next) {
  try {
    const productId = req.params.id;
    const deletedProduct = await Products.findByIdAndDelete(productId);
    if (!deletedProduct) {
       return sendResponse(res, 404, "Product not found");
    }
    res.json({ msg: 'Product deleted successfully' });
    return sendResponse(res, 200, "Product deleted successfull");
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
