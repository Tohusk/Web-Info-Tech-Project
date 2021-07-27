//controller for van schema
const mongoose = require("mongoose")
const geolocation = require("geolocation-utils")

// import van model
//const Van = mongoose.model("Van") such that unit test can work
const Van = require("../models/van")

const getLocation = async (req, res) => {
    req.session.latitude = req.body.latitude
    req.session.longitude = req.body.longitude
    return res.redirect('/customer')
}

const getVendorLocation = async (req, res) => {
    req.session.latitude = req.body.latitude
    req.session.longitude = req.body.longitude
    return res.redirect('/vendor/updateVan')
}

// Gets the geolocation of the van and renders the update van page
const getLocationAndUpdateVanPage = async (req, res) => {
    var location = "false";
    
    //if location approved, receive and store in session
    if (req.session.latitude) {
        location = "true";
    }

    var latitude;
    var longitude;
    
    if (req.session.latitude) {
        latitude = parseFloat(req.session.latitude)
        longitude = parseFloat(req.session.longitude)
    } else {
        //unimelb location
        latitude = -37.7963
        longitude = 144.9614
    }

    return res.render('updateVan', {'vanName' : req.session.name, "location": location})
}

// gets closest vans to user
const getAllVans = async (req, res) => {

    var location = "false";
    
    //if location approved, receive and store in session
    if (req.session.latitude) {
        location = "true";
    }

    var latitude;
    var longitude;
    
    if (req.session.latitude) {
        latitude = parseFloat(req.session.latitude)
        longitude = parseFloat(req.session.longitude)
    } else {
        //unimelb location
        latitude = -37.7963
        longitude = 144.9614
    }
    
    //find distance between location and van 
    try {
        const vans = await Van.find({open: true})
        const dic = {}
        for (var i=0; i<vans.length; i++) {
            dic[vans[i].name] = {"distance": (geolocation.distanceTo({
                lat: latitude,
                lon: longitude
            },{
                lat: vans[i].latitude,
                lon: vans[i].longitude
            }) / 1000 ).toFixed(2), 
            "address": vans[i].currentLocation,
            "id": vans[i]._id
        }}

        //https://stackoverflow.com/questions/1069666/sorting-object-property-by-values
        const sortable = Object.fromEntries(
            Object.entries(dic).sort(function(a,b){return a[1].distance-b[1].distance})
        );
        //https://stackoverflow.com/questions/39336556/how-can-i-slice-an-object-in-javascript/45195659
        const sliced = Object.keys(sortable).slice(0, 5).reduce((result, key) => {
            result[key] = sortable[key];

            return result;
        }, {});    

        return res.render("vansNearbyList", {"van": sliced, "location": location, "error": req.flash('noVan')[0]})
    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}

const getVanDetails = async(req, res) => {
    try {
        if (req.session.latitude){
            const van = await Van.findById(req.params.vanID)
            const distance = (geolocation.distanceTo({
                lat: parseFloat(req.session.latitude),
                lon: parseFloat(req.session.longitude)
            },{
                lat: van.latitude,
                lon: van.longitude
            }) / 1000 ).toFixed(2) 

            payload = {"name": van.name,
                       "address": van.currentLocation,
                       "distance": distance,
                       "image": van.image}
            res.render("vanDetails", {"van": payload})
        }
        
    } catch (err) {
        res.status(400)
        return res.send("Database query failed")
    }
}


// updates vans details, with van name in address and details in postman body
const updateVan = async (req, res) => {
    // Force well formatted data
    try {
        const filter = {name: req.session.name};
        const update = {currentLocation: req.body.currentLocation,
                        open: req.body.open,
                        latitude: parseFloat(req.session.latitude),
                        longitude:parseFloat(req.session.longitude)}
        // Vans are uniquely named
        let result = await Van.findOneAndUpdate(filter, update, {new: true});
        // returns updated van
        res.redirect('/vendor/orders/outstanding');
    } catch (err) {
        res.status(400)
        return res.send("OpenVan Database insert failed")
    }
}

const assignVan = async (req, res) => {
    req.session.vanName = req.body.vanName;
    return res.redirect('/customer/menu')
}

const closeVan = async (req, res) => {
    try {
        const filter = {name: req.session.name};
        const update = {open: false}

        let result = await Van.findOneAndUpdate(filter, update, {new: true});

        req.logout()
        res.redirect('/vendor/login')
    } catch (err) {
        res.status(400)
        return res.send("CloseVan Database insert failed")
    }
}

module.exports = {
    getAllVans,
    updateVan,
    getVanDetails,
    assignVan,
    getLocation,
    getVendorLocation,
    getLocationAndUpdateVanPage,
    closeVan
}