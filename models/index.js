//connect to mongoDB
require('dotenv').config()
const mongoose = require("mongoose")

// Connect to MongoDB login is retrieved from env variables
const CONNECTION_STRING = "mongodb+srv://<username>:<password>@animehunnies.xq3dl.mongodb.net/SnacksInAVan?retryWrites=true&w=majority"
const MONGO_URL = CONNECTION_STRING.replace("<username>", process.env.MONGO_USERNAME).replace("<password>", process.env.MONGO_PASSWORD)

mongoose.connect(MONGO_URL || "mongodb://localhost", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    dbName: "SnacksInAVan"
})

const db = mongoose.connection

// Exit with error code 1 if database error
db.on("error", err => {
    console.error(err);
    process.exit(1)
})

db.once("open", async() => {
    console.log("Mongo connection started on " + db.host + ":" + db.port)
})

require("./item")
require("./order")
require("./van")