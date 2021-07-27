// middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    // if not logged in, redirect to login form
    req.flash('login', 'You must login to access that page')
    res.redirect('/customer/user/login');
}

function isVendorLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    // if not logged in, redirect to login form
    req.flash('login', 'You must login to access that page')
    res.redirect('/vendor/login');
}


// export the function so that we can use
// in other parts of our all
module.exports = {
    isLoggedIn,
    isVendorLoggedIn

}