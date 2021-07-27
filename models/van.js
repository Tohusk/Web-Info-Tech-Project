//van schema
const mongoose = require("mongoose")
const bcrypt = require('bcrypt-nodejs')

const vanSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    currentLocation: String,
    latitude: Number,
    longitude: Number,
    image: {type: String, required: true},
    open: Boolean,
    password: {type: String, required: true}
})

vanSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

vanSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Create mongoose model based on schema defined above
const Van = mongoose.model("Van", vanSchema, "Van")

// Export that model
module.exports = Van 