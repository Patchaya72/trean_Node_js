const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product', required: true }],
    // For single-product orders using /:id/orders we store quantity here
    quantity: { type: Number, required: true, default: 1, min: 1 },
    totalPrice: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' }
});
module.exports = mongoose.model('Order', orderSchema);