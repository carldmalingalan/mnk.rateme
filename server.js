// Server depd's
const express = require("express");
const app = express();
const session = require("express-session");
const ejs = require("ejs");
const engine = require("ejs-mate");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");

/*
    @title - Environment Variables
    @desc - This only runs in development environment
*/
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Mongoose Connection
mongoose.connect(
  process.env.MongoURI,
  {
    useNewUrlParser: true,
    useCreateIndex: true
  },
  err => {
    if (err) throw err;
    console.log("Connected to MongoDB");
  }
);

// Static
app.use(express.static("public"));

// View Engine
app.engine("ejs", engine);
app.set("view engine", "ejs");

// Middleware
app.use(express.json());
app.use(
  session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

// Routes
app.use("/", require("./route"));

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port: ${process.env.PORT}`);
});
