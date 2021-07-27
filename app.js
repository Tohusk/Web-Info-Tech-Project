const express = require('express');
const app = express();

const exphbs = require('express-handlebars')

const passport = require('passport')

const session = require('express-session')

const flash = require('connect-flash-plus')

const methodOverride = require('method-override')

require("./models");

const customerRouter = require('./routes/customerRouter');
const vendorRouter = require('./routes/vendorRouter');

var hbs = exphbs.create({});

hbs.handlebars.registerHelper('totalPrice', function(count, price) {
    if (count == 0) {
        return 0;
    }
    else {
        return count*price;
    }
});

app.use(session({ secret: process.env.PASSPORT_KEY,
    resave: true,
    saveUninitialized: true
   }));
     
app.use(passport.initialize());

app.use(passport.session());

app.use(flash());

app.use(express.urlencoded({ extended: true }))

app.use(express.json());

app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.redirect('/customer')
})

app.use('/customer', customerRouter)

app.use('/vendor', vendorRouter)


app.use(express.static('public')) // define where static assets live

app.engine('hbs', exphbs({  
    defaultlayout: 'main',  
    extname: 'hbs',
    partialsDir: __dirname + "/views/partials/"
}))   

app.set('view engine', 'hbs')

app.use((req, res,next) => {
    res.render('pageNotFound');
 });


app.listen(process.env.PORT || 3000, () => {
    console.log('The app is listening on port 3000!')
})

// need to export app for testing purposes
module.exports = app