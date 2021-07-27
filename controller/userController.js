//controller for item schema 
const mongoose = require("mongoose")

// import item model
const User = mongoose.model("User")
const Item = mongoose.model("Item")
const Van = mongoose.model("Van")

const getUserDetails = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.session.email }).lean()
        return res.render('account', { 'user': user, "error": req.flash('password')[0] })
    }
    catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

const getCart = async (req, res) => {
    try {
        //check if van is selected
        if (!req.session.vanName) {
            req.flash('noVan', 'You must select a van')
            return res.redirect("/customer")
        }
        let van = await Van.findOne({ name: req.session.vanName },
            { name: true, currentLocation: true, latitude: true, longitude: true }).lean()
        let user = await User.findOne({ email: req.session.email })
        let items = await getItemsFromCart(user.cart)
        let total = getTotal(items);
        let map = getQuantityDict(items)
        return res.render('cart', { 'items': map, 'total': total, 'van': van, 'error': req.flash('emptyCart')[0]})
    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

const addItemToCart = async (req, res) => {

    try {
        let user = await User.findOne({ email: req.session.email })
        //get item from url 
        itemID = req.params.itemID;
        user.cart.push(itemID)
        user.save()
        return res.redirect('/customer/menu/' + req.params.itemID);
    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

const removeItemFromCart = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.session.email })
        //get item from url 
        itemID = req.params.itemID;
        itemIndex = user.cart.indexOf(itemID)
        if (itemIndex > -1) {
            user.cart.splice(itemIndex, 1);
        }
        user.save()
        return res.redirect('/customer/menu/' + req.params.itemID);

    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

//grabs item details using item id
const getItemsFromCart = async (cart) => {
    items = []
    for (var i = 0; i < cart.length; i++) {
        const oneItem = await Item.findOne({ _id: cart[i] },
            { name: true, image: true, price: true, description: true }).lean()
        items.push(oneItem)
    }
    return items;
}
//gets total from cart details
const getTotal = (cart) => {
    total = 0
    for (var i = 0; i < cart.length; i++) {
        total += cart[i].price
    }
    return total;
}
//maps quantity with item 
const getQuantityDict = (cart) => {
    var dict = {};
    for (i = 0; i < cart.length; i++) {
        item = cart[i].name
        if (dict.hasOwnProperty(item)) {
            dict[item].quantity++;
        } else {
            dict[item] = { "_id": cart[i]._id, "price": cart[i].price, "quantity": 1 };
        }
    }
    return dict;
}

const userChangePassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.session.email });
        if (req.body.pwdNew.localeCompare(req.body.pwdConfirm) == 0) {
            if (req.body.pwdNew.localeCompare(req.body.pwdOld) == 0 || req.body.pwdConfirm.localeCompare(req.body.pwdOld) == 0) {
                //new password is same as old password
                req.flash('password', 'Password change failed, new password is same as old password')
            }
            else if (user.setPassword(req.body.pwdOld, req.body.pwdConfirm)) {
                //new password is set
                req.flash('password', 'New password set!')
            }
            else {
                //old password doesnt work 
                req.flash('password', 'Password change failed, incorrect password')
            }
        }

        else {
            //new password doesnt match
            req.flash('password', 'Password change failed, new passwords do not match')
        }
        return res.redirect('/customer/user/account')
    }
    catch (err) {
        console.log(err)
        res.status(400)
        return res.send("Database query failed")
    }
}

module.exports = {
    addItemToCart,
    getCart,
    removeItemFromCart,
    getItemsFromCart,
    getTotal,
    getQuantityDict,
    getUserDetails,
    userChangePassword
}