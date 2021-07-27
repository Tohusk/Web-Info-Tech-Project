const express = require("express");
const { reset } = require("nodemon");

const utilities = require('./utility');


// we will use the passport strategies we defined in 
// passport.js file in config folder to signup and login 
// a user.
const passport = require('passport');
require('../config/passport')(passport);

// create user router
const userRouter = express.Router();

const userController = require('../controller/userController.js')

// load/import the user controller NOT IMPLEMENTED YET
//const userController = require("../controllers/userController.js");

// GET login form
// http:localhost:5000/user/
userRouter.get("/login", (req, res) => {
    res.render('login', {"error": req.flash('login')[0]});
});

// POST login form -- authenticate user
// http:localhost:5000/user/login
userRouter.post('/login', passport.authenticate('customerLogin', {
    successRedirect : '/customer/menu', // redirect to the homepage
    failureRedirect : '/customer/user/login', // redirect back to the login page if there is an error
    failureFlash : true // allow flash messages
}));

// GET - show the signup form to the user
// http:localhost:5000/user/signup
userRouter.get("/signup", (req, res) => {
    res.render('signup', {"error": req.flash('signup')[0]});
});

// sort out duplicates
// POST - user submits the signup form -- signup a new user
// http:localhost:5000/user/signup
userRouter.post('/signup', passport.authenticate('customerSignUp', {
    successRedirect : '/customer/menu', // redirect to the homepage
    failureRedirect : '/customer/user/signup/', // redirect to signup page
    failureFlash : true // allow flash messages
}));

// LOGOUT
userRouter.get('/logout', function(req, res) {
    // save the favourites
    req.logout();
    req.flash('');
    res.redirect('/');
});

//GET - show account details to user
userRouter.get('/account', utilities.isLoggedIn, userController.getUserDetails);

//PUT - update account password
userRouter.post('/account', utilities.isLoggedIn, userController.userChangePassword);

// export the router
module.exports = userRouter;
//adds item to users cart based on itemID
userRouter.get('/additem/:itemID', utilities.isLoggedIn, userController.addItemToCart)
//remove item from cart
userRouter.get('/removeitem/:itemID', utilities.isLoggedIn, userController.removeItemFromCart)
//shows the cart 
userRouter.get('/cart', utilities.isLoggedIn, userController.getCart)

userRouter.use((req, res,next) => {
    res.render('pageNotFound');
 });
