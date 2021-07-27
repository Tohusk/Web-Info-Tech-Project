//controller for order schema
const mongoose = require("mongoose")

const userController = require('./userController.js')

// import order model
const Order = mongoose.model("Order")
const User = mongoose.model("User")
const Van = mongoose.model("Van")

const getOneOrder = async (req, res) => {
    try {
        const oneOrder = await Order.findOne({ _id: req.params.orderID },
            { user: true, items: true, totalPrice: true, discount: true, orderTime: true, van: true, status: true }).populate("van").lean()
        //check if this is current user's order, if not redirect 
        const user = await User.findOne({ email: req.session.email }).lean()
        if (JSON.stringify(user._id) !== JSON.stringify(oneOrder.user)) {
            req.flash('wrongUser', 'You cannot access this order')
            return res.redirect("/customer/orders")
        }
        const items = await userController.getItemsFromCart(oneOrder.items);
        const map = userController.getQuantityDict(items)

        if (oneOrder === null) {
            res.status(404)
            return res.send("Order not found")
        }

        res.render('orderDetails', { "order": oneOrder, "items": map, "error": req.flash('changeExpired')[0] })
    } catch (err) {
        if (err.name == 'CastError') {
            req.flash('wrongUser', 'This order does not exist')
            return res.redirect("/customer/orders")
        }
        res.status(400)
        return res.send("Database query failed")
    }
}

const getOrderDetailsVendor = async (req, res) => {
    try {
        const oneOrder = await Order.findOne({ _id: req.params.orderID }).populate("user").lean()
        //check if this is current van's order, if not redirect    
        const van = await Van.findOne({ name: req.session.name }).lean()
        if (JSON.stringify(van._id) !== JSON.stringify(oneOrder.van)) {
            req.flash('wrongVan', 'You cannot access this order')
            return res.redirect("/vendor/sidebar")
        }
        const items = await userController.getItemsFromCart(oneOrder.items);
        const map = userController.getQuantityDict(items)

        if (oneOrder === null) {
            res.status(404)
            return res.send("Order not found")
        }

        if (oneOrder.pickedUpTime != null) {
            res.render('vendorPickedUpOrderDetails', { "order": oneOrder, "items": map })
        }
        // render fulfilled order
        else if (oneOrder.fulfilledTime != null) {
            res.render('vendorFulfilledOrderDetails', { "order": oneOrder, "items": map })
        }
        // render outstanding order
        else {
            res.render('vendorOutstandingOrderDetails', { "order": oneOrder, "items": map })
        }
    } catch (err) {
        if (err.name == 'CastError') {
            req.flash('wrongVan', 'This order does not exist')
            return res.redirect("/vendor/sidebar")
        }
        res.status(400)
        return res.send("Database query failed")
    }
}

const getAllFulfilledOrdersByVan = async (req, res) => {
    try {
        const van = await Van.findOne({ name: req.session.name }).lean()
        const vanID = van._id;
        const orders = await Order.find({ status: "Fulfilled", van: vanID }).populate("user").lean()
        res.render("vendorFulfilledOrders", { "van": van, "orders": orders })
    } catch (err) {
        res.status(400)
        return res.send("Order not found")
    }
}

//gets all outstanding orders for the van in the address
const getAllCompletedOrdersByVan = async (req, res) => {
    try {
        const van = await Van.findOne({ name: req.session.name }).lean()
        const vanID = van._id;
        const orders = await Order.find({ status: "Completed", van: vanID }).populate("user").lean()
        res.render('vendorCompletedOrders', { "van": van, "orders": orders })
    } catch (err) {
        res.status(400)
        return res.send("Order not found")
    }
}

//gets all outstanding orders for the van in the address
const getAllOutstandingOrdersByVan = async (req, res) => {
    try {
        const van = await Van.findOne({ name: req.session.name }).lean()
        const vanID = van._id;
        const orders = await Order.find({ status: "Outstanding", van: vanID }).populate("user").lean()
        res.render('vendorOutstandingOrders', { "van": van, "orders": orders })
    } catch (err) {
        res.status(400)
        return res.send("Order not found")
    }
}

const getAllOutstandingOrdersByUser = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.session.email })
        const userID = user._id
        var outstandingOrders = await Order.find({ status: "Outstanding", user: userID },
            { orderTime: true, van: true, status: true }).populate("van").lean()
        var fulfilledOrders = await Order.find({ status: "Fulfilled", user: userID },
            { orderTime: true, van: true, status: true }).populate("van").lean()
        var completedOrders = await Order.find({ status: "Completed", user: userID },
            { orderTime: true, van: true, status: true }).populate("van").lean()
        outstandingOrders = outstandingOrders.reverse()
        fulfilledOrders = fulfilledOrders.reverse()
        completedOrders = completedOrders.reverse()
        return res.render('orders', {
            "outstandingOrders": outstandingOrders,
            "fulfilledOrders": fulfilledOrders,
            "completedOrders": completedOrders,
            "error": req.flash('wrongUser')[0]
        })
    } catch (err) {
        res.status(400)
        return res.send("Order not found")
    }
}

//posts new order with van in address
const addOrder = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.session.email })
        if (user.cart.length === 0) {
            req.flash('emptyCart', 'No items in the cart')
            return res.redirect("/customer/user/cart")
        }
        let totalPrice = userController.getTotal(await userController.getItemsFromCart(user.cart))
        const van = await Van.findOne({ name: req.session.vanName })
        const vanID = van._id
        const order = new Order({
            "user": user._id,
            "items": user.cart,
            "totalPrice": totalPrice,
            "discount": false,
            "orderTime": new Date(),
            "van": vanID,
            "status": "Outstanding",
        })

        //remove van from session
        req.session.vanName.expires = new Date().getTime();

        let result = await order.save()  // save new order object to database
        user.cart = [] //empty cart
        user.save()
        return res.redirect("/customer/orders")
    } catch (err) {   // error detected
        res.status(400)
        return res.send("Database insert failed")
    }
}

//vendor marks order as fulfiilled with orderID in address
//TODO need to add discount
const markOrderFulfilled = async (req, res) => {
    try {
        orderID = req.params.orderID
        //check if this is current vans's order, if not redirect    
        const oneOrder = await Order.findOne({ _id: orderID }).lean()
        const van = await Van.findOne({ name: req.session.name }).lean()
        if (JSON.stringify(van._id) !== JSON.stringify(oneOrder.van)) {
            req.flash('wrongVan', 'You cannot fulfill this order')
            return res.redirect("/vendor/sidebar")
        }
        let currentTime = new Date()
        let update;
        if (req.body.discount == "true") {
            let totalPrice = JSON.parse(oneOrder.totalPrice)
            let discountedPrice = totalPrice * 0.8;
            let discountedPriceRounded = discountedPrice.toFixed(2);
            update = { status: "Fulfilled", discount: req.body.discount, fulfilledTime: currentTime, totalPrice: discountedPriceRounded }
        }
        else {
            update = { status: "Fulfilled", discount: req.body.discount, fulfilledTime: currentTime }
        }
        const result = await Order.findByIdAndUpdate(orderID, update, { new: true })
        // Redirect to orders outstanding
        return res.redirect('/vendor/orders/outstanding')
    } catch (err) {
        res.status(400)
        return res.send("Order fulfillment update failed")
    }
}

const markOrderCompleted = async (req, res) => {
    try {
        let orderID = req.params.orderID
        //check if this is current vans's order, if not redirect    
        const oneOrder = await Order.findOne({ _id: orderID }).lean()
        const van = await Van.findOne({ name: req.session.name }).lean()
        if (JSON.stringify(van._id) !== JSON.stringify(oneOrder.van)) {
            req.flash('wrongVan', 'You cannot fulfill this order')
            return res.redirect("/vendor/sidebar")
        }
        let currentTime = new Date()
        let update = { status: "Completed", pickedUpTime: currentTime }
        const result = await Order.findByIdAndUpdate(orderID, update, { new: true })
        // Redirect to orders fulfilled
        return res.redirect('/vendor/orders/fulfilled')

    } catch (err) {
        res.status(400)
        return res.send("Order fulfillment update failed")
    }
}

const cancelOrder = async (req, res) => {
    try {
        orderID = req.params.orderID;
        const oneOrder = await Order.findOne({ _id: orderID })
        //check if this is current user's order, if not redirect 
        const user = await User.findOne({ email: req.session.email }).lean()
        if (JSON.stringify(user._id) !== JSON.stringify(oneOrder.user)) {
            req.flash('wrongUser', 'You cannot access this order')
            return res.redirect("/customer/orders")
        }
        //check if it has been 10 minutes, cannot cancel 
        var now = new Date();
        var diff = now - oneOrder.orderTime;
        var minutes = Math.floor(diff / 6e4);
        if (minutes >= 10 || oneOrder.status !== "Outstanding") {
            req.flash('changeExpired', 'You cannot cancel this order')
            return res.redirect("/customer/orders/" + orderID)
        }
        update = { status: "Cancelled" };
        const result = await Order.findByIdAndUpdate(orderID, update, { new: true })
        return res.redirect("/customer/orders")
    } catch (err) {
        res.status(400)
        return res.send("Failed cancel order")
    }
}

const changeOrder = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.session.email })
        const orderID = req.params.orderID;
        const oneOrder = await Order.findOne({ _id: orderID })
        //check if this is current user's order, if not redirect 
        if (JSON.stringify(user._id) !== JSON.stringify(oneOrder.user)) {
            req.flash('wrongUser', 'You cannot access this order')
            return res.redirect("/customer/orders")
        }
        //check if it has been 10 minutes, cannot change 
        var now = new Date();
        var diff = now - oneOrder.orderTime;
        var minutes = Math.floor(diff / 6e4);
        if (minutes >= 10 || oneOrder.status !== "Outstanding") {
            req.flash('changeExpired', 'You cannot change this order')
            return res.redirect("/customer/orders/" + orderID)
        }
        //put items from order into cart
        const items = oneOrder.items;
        user.cart = items;
        user.save()
        //change order status to changed
        oneOrder.status = "Changed";
        oneOrder.save()
        //send back to cart
        return res.redirect("/customer/user/cart")
    } catch (err) {
        res.status(400)
        return res.send("Failed change order")
    }
}

module.exports = {
    addOrder,
    markOrderFulfilled,
    getAllOutstandingOrdersByVan,
    getAllOutstandingOrdersByUser,
    getOneOrder,
    cancelOrder,
    changeOrder,
    getAllFulfilledOrdersByVan,
    getAllCompletedOrdersByVan,
    getOrderDetailsVendor,
    markOrderCompleted
}