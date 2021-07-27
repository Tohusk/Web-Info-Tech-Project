// used to create our local strategy for authenticating
// using username and password
const LocalStrategy = require('passport-local').Strategy;
// our user model
const { User } = require('../models/user');

const  Van  = require('../models/van');

module.exports = function(passport) {

    // these two functions are used by passport to store information
    // in and retrieve data from sessions. We are using user's object id
    passport.serializeUser(function(obj, done) {
        // alternatively
        // done(null, obj._id))
        if (obj instanceof User) {
            done(null, { id: obj._id, type: 'User'});
        }
        // Instance of Van
        else {
            done(null, { id: obj._id, type: 'Van'});
        }
    });

    passport.deserializeUser(function(obj, done) {
        if (obj.type === 'User') {
            User.findById(obj.id, function(err, user) {
                done(err, user);
            });
        }
        else {
            Van.findById(obj.id, function(err, van) {
                done(err, van);
            });
        }
    });

    // Vendor Login
    passport.use('vendorLogin', new LocalStrategy({
        usernameField : 'name',
        password : 'password',
        passReqToCallback : true},
        function (req, name, password, done) {
            process.nextTick(function() {
                Van.findOne({ 'name' : name }, function(err, van) {
                    if (err)
                        return done(err);
                    if (!van)
                        return done(null, false, req.flash('login', 'No van found.'))
                    if (!van.validPassword(password)) {
                        return done(null, false, req.flash('login', 'Oops! Wrong password.'));
                    }    
                    else {
                        req.session.name = name;
                        return done(null, van, req.flash('vendorloginpass', 'Login successful'));
                    }
                });
            });
    }));

    // Vendor Creating new van
    passport.use('vendorCreateVan', new LocalStrategy({
        usernameField : 'name',
        passwordField : 'password',
        passReqToCallback : true }, // pass the req as the first arg to the callback for verification 
        
     function(req, name, password, done) {             
        process.nextTick( function() {
            Van.findOne({'name': name}, function(err, existingVan) {
                // search a van by the name
                // if van is not found or exists, exit with false indicating
                // authentication failure
                if (err) {
                    console.log(err);
                    return done(err);
                }
                if (existingVan) {
                    console.log("existing");
                    return done(null, false, req.flash('signupMessage', 'That name is already taken.'));
                }
                else {
                    // otherwise
                    // create a new van
                    var newVan = new Van();
                    newVan.name = name;
                    newVan.password = newVan.generateHash(password);
                    newVan.image = req.body.image;
                    newVan.open = false;
                    
                    // and save the user
                    newVan.save(function(err) {
                        if (err)
                            throw err;

                        return done(null, newVan);
                    });

                    // put the van's name in the session so that it can now be used for all
                    // communications between the client (browser) and the FoodBuddy app
                    req.session.name=name;
                }
            });
        });
    }));

    // Customer Login
    passport.use('customerLogin', new LocalStrategy({
        usernameField : 'email', 
        passwordField : 'password',
        passReqToCallback : true}, // pass the req as the first arg to the callback for verification 
        function(req, email, password, done) {
            
            // you can read more about the nextTick() function here: 
            // https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/
            // we are using it because without it the User.findOne does not work,
            // so it's part of the 'syntax'
            process.nextTick(function() {
                // see if the user with the email exists
                User.findOne({ 'email' :  email }, function(err, user) {
                    // if there are errors, user is not found or password
                    // does match, send back errors
                    if (err)
                        return done(err);
                    if (!user)
                        return done(null, false, req.flash('login', 'No user found.'));

                    if (!user.validPassword(password)){
                        // false in done() indicates to the strategy that authentication has
                        // failed
                        return done(null, false, req.flash('login', 'Oops! Wrong password.'));
                    }
                    // otherwise, we put the user's email in the session
                    else {
                        // in app.js, we have indicated that we will be using sessions
                        // the server uses the included modules to create and manage
                        // sessions. each client gets assigned a unique identifier and the
                        // server uses that identifier to identify different clients
                        // all this is handled by the session middleware that we are using 
                        req.session.email = email; // for demonstration of using express-session
                        
                        // done() is used by the strategy to set the authentication status with
                        // details of the user who was authenticated
                        return done(null, user, req.flash('loginpass', 'Login successful'));
                    }
                });
            });

    }));



    // Customer Signup
    passport.use('customerSignUp', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true }, // pass the req as the first arg to the callback for verification 
            
         function(req, email, password, done) {             
            process.nextTick( function() {
                User.findOne({'email': email}, function(err, existingUser) {
                    // search a user by the username (email in our case)
                    // if user is not found or exists, exit with false indicating
                    // authentication failure
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    if (existingUser) {
                        console.log("existing");
                        return done(null, false, req.flash('signup', 'That email is already taken.'));
                    }
                    else {
                        // otherwise
                        // create a new user
                        var newUser = new User();
                        newUser.email = email;
                        newUser.password = newUser.generateHash(password);
                        newUser.nameFamily = req.body.nameFamily;
                        newUser.nameGiven = req.body.nameGiven;
                        newUser.cart = [];
                        newUser.orders = [];

                        // and save the user
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            return done(null, newUser);
                        });

                        // put the user's email in the session so that it can now be used for all
                        // communications between the client (browser) and the FoodBuddy app
                        req.session.email=email;
                    }
                });
            });
        }));
};