//user schema
const mongoose = require("mongoose")
const bcrypt = require('bcrypt-nodejs');
const { reset } = require("nodemon");

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    nameFamily: {type: String, required: true},
    nameGiven: {type: String, required: true},
    //An array of the items in the users cart
    cart: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}],
    // An array current and past orders
    orders: [{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}],
    loginAttempts: {type: Number, required: true, default:0},
    lockUntil: {type: Number}
})

//generates a hash, for password hashing
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.setPassword = function(pwdOld, pwdNew) {
    if (this.validPassword(pwdOld)) {
        this.password = this.generateHash(pwdNew);
        this.save();
        return true;
    }
    else {
        return false;
    }
}


// Create mongoose model based on schema defined above
const User = mongoose.model("User", userSchema, "User")

// Export that model
module.exports = { User };   