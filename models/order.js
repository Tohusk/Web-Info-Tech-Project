//order schema
const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    totalPrice: {type: Number, required: true},
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}],
    discount: Boolean,
    orderTime: Date,
    fulfilledTime: Date,
    pickedUpTime: Date,
    van: {type: mongoose.Schema.Types.ObjectId, ref: 'Van'},
    status: String

})

// Create mongoose model based on schema defined above
const Order = mongoose.model("Order", orderSchema, "Order")

// Export that model
module.exports = Order