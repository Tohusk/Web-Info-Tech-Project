# INFO30005 – Web Information Technologies

**Testing instructions:**  

**Both tests:** npm test --forceExit

**Integration test:** npm test -- setvanstatus_integration.js --forceExit

**Unit test:** npm test -- setvanstatus_unit.js --forceExit    

  
**CUSTOMER**

1. View menu of snacks (including pictures and prices)

   The get request returns a json of all items currently in the database.

2. View details of a snack

   The get request returns a json of a specific item referenced in the url. In the get request we sent, the item specified is the Cappuccino.

3. Customer starts a new order by requesting a snack

   The post request takes order items and order total price in the request body, adds a new order object to the database with reference to the van specified in the url. In the request we sent, the order created is for one Cappuccino.

**VENDOR**

1. Setting van status (vendor sends location, marks van as ready-for-orders)

   The put request updates the van specified in the url, marking a written location and geo-location as specified in the request body along with updating it to open, also in the request body. In the request we sent, the van updated is the van called "animeHunniesVan" and the location is set "On South Lawn", with latitudes and longitudes 10 and 20.

2. Show list of all outstanding orders

   The get request fetches all orders for a given van in the url which have the order status as "Outstanding", returning a json of those orders. The get request we sent should return two unfulfilled orders, one which was created in the post request previously and one which we preplaced.

3. Mark an order as "fulfilled" (ready to be picked up by customer)

   The put request updates an order allocated to a van both of which are specified in the url, van by name and order by id. The request changes the order status to "Fulfilled", and updates the discount field as specified in the request body. The request we sent will fulfill the order we preplaced. 

