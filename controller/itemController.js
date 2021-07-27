//controller for item schema 
const mongoose = require("mongoose")

// import item model
const Item = mongoose.model("Item")
const User = mongoose.model("User")


// gets all items sold by van and returns them to the viewer
const getAllItems = async (req, res) => {
    try {
        //check if van is selected
        if (!req.session.vanName) {
            req.flash('noVan', 'You must select a van')
            return res.redirect("/customer")
        }
        const items = await Item.find({}).lean()
        res.render('menu',{"items": items, "error": req.flash('castError')[0]})
    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}
//gets the item via the route address
const getOneItem = async (req, res) => {
    try {
        //check if van is selected
        if (!req.session.vanName) {
            req.flash('noVan', 'You must select a van')
            return res.redirect("/customer")
        }
        //user is logged in, get amount in cart
        var count=0;
        var nobutton;
        if (req.session.email) {
            const user = await User.findOne({ email: req.session.email })
            for (var i=0; i<user.cart.length; i++) {
                if (JSON.stringify(user.cart[i]) === JSON.stringify(req.params.itemID)) {
                    count++;
                    nobutton ="bruh"
                }
            }
        }
        const oneItem = await Item.findOne( {_id: req.params.itemID}).lean()
        if (oneItem === null) {
            res.status(404)
            return res.send("Item not found")
        }

        res.render('foodDetails',{"item":oneItem, "count": count, "button": nobutton, "loggedin":req.isAuthenticated()})
    } catch (err) {
        console.log(err)
        if (err.name == 'CastError') {
            req.flash('castError', 'This item does not exist')
            return res.redirect("/customer/menu")
        }
        res.status(400)
        return res.send("Database query failed")
    }
}

module.exports = {
    getAllItems,
    getOneItem
}