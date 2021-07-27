//routes for customer
const express = require('express')

// add our router
const customerRouter = express.Router()

const userRouter = require('./userRouter');
const utilities = require('./utility');

// require the controllers
const itemController = require('../controller/itemController.js')
const orderController = require('../controller/orderController.js')
const vanController = require('../controller/vanController.js')

customerRouter.use('/user', userRouter)

// By default get list of all vans
customerRouter.get('/', vanController.getAllVans)
// Updates when allow location 
customerRouter.post('/location', vanController.getLocation)
// Show details of van 
customerRouter.get('/van/:vanID', vanController.getVanDetails)
// Assign van to session
customerRouter.post('/van/assignVan', vanController.assignVan)
// gets list of items, with pictures and prices on the menu
customerRouter.get('/menu', itemController.getAllItems)
// view details of a snack 
customerRouter.get('/menu/:itemID', itemController.getOneItem)
//creates a new order
customerRouter.get('/order', utilities.isLoggedIn, orderController.addOrder)
//see all user's orders
customerRouter.get('/orders', utilities.isLoggedIn, orderController.getAllOutstandingOrdersByUser)
//see specific order for user
customerRouter.get('/orders/:orderID', utilities.isLoggedIn, orderController.getOneOrder)
//cancel order
customerRouter.get('/orders/:orderID/cancel', utilities.isLoggedIn, orderController.cancelOrder)
//change order 
customerRouter.get('/orders/:orderID/change', utilities.isLoggedIn, orderController.changeOrder)

customerRouter.get('/sidebar', (req, res) => {
    res.render('sidebar',  {"loggedin":req.isAuthenticated()})
})

customerRouter.use((req, res,next) => {
    res.render('pageNotFound');
 });

module.exports = customerRouter