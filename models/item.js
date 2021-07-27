//item schema
const mongoose = require("mongoose")

const itemSchema = new mongoose.Schema({
    // Maybe string instead? Do we even need itemID?
    name: {type: String, required: true, unique: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    image: {type: String, required: true},
    // An array of strings detail the options of the food item
    options: [String]
})

// Create mongoose model based on schema defined above
const Item = mongoose.model("Item", itemSchema, "Item")

// Export that model
module.exports = Item