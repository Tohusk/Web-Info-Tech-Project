/*
"describe" is a block that takes two arguments, test suite name and 
a callback with the tests in the suite. 

Each test in the suite is put inside the "test" block, which has the 
test name and a callback that implements the actual test
*/
// connect to Mongoose model
const mongoose = require('mongoose')

// we are going to test the updateVan from the food controller 
const vanController = require("../controller/vanController")

// we will need the Food model. Note that I have also changed the
// way I import the Food and User models in the foodController.js
// because the test would not run without me making that change.
const Van = require("../models/van")


// defining a test suite for testing the getOneFood
describe("Unit testing updateVan from vanController.js", () => {

    // mocking the request object. The controller function expects 
    // that at least the request object will have an 'id' params, and
    // isAuthenticated() function.
    // we create a mocking function using jest.fn(), and we can
    // return a mock value for the mock function as well.
    // see: https://jestjs.io/docs/mock-functions
    const req = {
        // searching for Apple in my database
        params: { id: '60741060d14008bd0efff9d5' },

        session: {
            name: "test",
            latitude: "0.1",
            longitude: "0.1"
        },

        body: {
            currentLocation: "Test location",
            open: "false"
        },
        // assuming that the user is logged in
        isAuthenticated: jest.fn().mockReturnValue('True')
    };

    // response object should have at least a render method
    // so that the controller can render the view
    const res = {
        redirect: jest.fn()
    };

    // the setup function does a few things before
    // any test is run
    beforeAll(() => {
        // clear the render method (also read about mockReset)
        res.redirect.mockClear();

        Van.findOneAndUpdate = jest.fn().mockResolvedValue([{
            _id: '60b21ac51285791174388c37',
            name: 'test',
            "name": "test",
            password: "$2a$10$Pt9O4KbdMhDXvtt9c2QxnOaw2UTQgHtwgQKS9M/zRObXlNSC1s2y2",
            image: "https://images.unsplash.com/photo-1615465502839-71d5974f5087",
            open: false,
            "__v": 0,
            currentLocation: "Test location",
            latitude: 0.1,
            longitude: 0.1
        }]);

        vanController.updateVan(req, res);
    });

    // This demo has only one test with a valid food ID 
    test("Test case 1: testing with test van \
        and with some data, expecting redirect to another page", () => {
        //called if no errors
        expect(res.redirect).toHaveBeenCalledTimes(1);

    });
});
