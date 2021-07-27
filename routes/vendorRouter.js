//routes for vendors
const express = require('express')
const passport = require('passport')
require('../config/passport')(passport);

const utilities = require('./utility');



// add our router
const vendorRouter = express.Router()

// require the controllers
const orderController = require('../controller/orderController.js')
const vanController = require('../controller/vanController.js')

vendorRouter.get('/', (req, res) => {
    res.redirect('/vendor/login')
})

vendorRouter.post('/location', utilities.isVendorLoggedIn, vanController.getVendorLocation)


// vendorRouter.get('/updateVan', (req, res) => {
//     res.render('updateVan', {'vanName' : req.session.name});
// });
vendorRouter.get('/updateVan', utilities.isVendorLoggedIn, vanController.getLocationAndUpdateVanPage)

//updates van details using van address and postman
vendorRouter.put('/updateVan', utilities.isVendorLoggedIn, vanController.updateVan)
//view all of the outstanding orders for the van in the address
vendorRouter.get('/orders/outstanding', utilities.isVendorLoggedIn, orderController.getAllOutstandingOrdersByVan)
//view all of the fulfilled orders for the van in the address
vendorRouter.get('/orders/fulfilled', utilities.isVendorLoggedIn, orderController.getAllFulfilledOrdersByVan)
//view all of the completed orders for the van in the address
vendorRouter.get('/orders/completed', utilities.isVendorLoggedIn, orderController.getAllCompletedOrdersByVan)
// Order details
vendorRouter.get('/orders/:orderID', utilities.isVendorLoggedIn, orderController.getOrderDetailsVendor)



//allows a vendor to mark an order as fulfilled
vendorRouter.put('/orders/:orderID/fulfill', utilities.isVendorLoggedIn, orderController.markOrderFulfilled)

vendorRouter.put('/orders/:orderID/completed', utilities.isVendorLoggedIn, orderController.markOrderCompleted)



// LOGIN AND CREATE VAN
vendorRouter.get('/login', (req, res) => {
    res.render('vendorLogin', {"error": req.flash('login')[0]});
});
//login to van
// need failure redirect
vendorRouter.post('/login', passport.authenticate('vendorLogin', {
    successRedirect : '/vendor/updateVan',
    failureRedirect : '/vendor/login'
}));

// vendorRouter.get('/createVan', (req, res) => {
//     res.render('createVan');
// });

vendorRouter.get('/closeVan', utilities.isVendorLoggedIn, vanController.closeVan)

vendorRouter.post('/createVan', passport.authenticate('vendorCreateVan', {
    successFlash: 'created!'
}));

vendorRouter.get('/sidebar', (req, res) => {
    res.render('vendorSidebar', {"loggedin":req.isAuthenticated(), "error": req.flash('wrongVan')[0]})
})

vendorRouter.use((req, res,next) => {
    res.render('pageNotFound');
 });

module.exports = vendorRouter