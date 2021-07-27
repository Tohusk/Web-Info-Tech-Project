
// supertest allows us to send HTTP requests to our app
// install it: npm install supertest --save-dev
const request = require('supertest');

// IMPORTANT: make sure your export your app in app.js .e.g.
// module.exports = app
const app = require('../app'); // the express server
/*const { collection } = require('../../models/food');*/



describe('Integration test: set van status', () => {
  // we need to use request.agent so that we can create and
  // use sessions
  let agent = request.agent(app);

  // These types of functions are called to 'setup' or
  // 'tear down' functions. In this example, we are
  // using the beforeAll function to create a request
  // agent that is authenticated and can be used by all
  // tests within  this suite. 
  beforeAll(() => agent
    // send a POST request to login
    .post('/vendor/login')
    // IMPORTANT: without the content type setting your request
    // will be ignored by express
    .set('Content-Type', 'application/x-www-form-urlencoded')
    // send the username and password
    .send({
      name: 'test',
      password: 'test',
    })); 
    //get location and store as cookie
    beforeAll(() => agent

    .post('/vendor/location')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send({
      latitude: 0,
      longitude: 0
    }));

  // set van named test to location 'Terra nullius (0,0)' and set as closed 
  // change can be seen on database for van
  test('Test 1: updated Test van', () => {
    return agent
      .put('/vendor/updateVan')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      // send the location and status
      .send({
        currentLocation: 'Terra nullius',
        open: 'false',
      })
      // expect to redirect to 
      .expect("Found. Redirecting to /vendor/orders/outstanding")
  });
});
