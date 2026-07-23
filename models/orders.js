const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// order status: processing, shipped, delivered, cancelled
// payment status: pending, paid, failed

const orderSchema = new Schema({
    id: { type: String, required: true, unique: true },
    uid: { type: String, required: true },
    products: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        imageURL: { type: String, required: true },
    }],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true },
    orderStatus: { type: String, enum: ["processing", "shipped", "delivered", "cancelled"], default: "processing" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
}, { timestamps: true });

module.exports = model("orders", orderSchema);
