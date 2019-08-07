// Server depd's
const express = require("express");
const app = express();
const session = require("express-session");
const ejs = require("ejs");
const engine = require("ejs-mate");
const MongoStore = require("connect-mongo")(session);
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require("path");

/*
    @title - Environment Variables
    @desc - This only runs in development environment
*/
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Mongoose Connection
mongoose
  .connect(process.env.MongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    throw err;
  });

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// View Engine
app.engine("ejs", engine);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Passport js import
require("./middleware/auth/passport");

// Routes
app.use("/", require("./route"));
app.use("/auth", require("./route/auth"));
app.use("/company", require("./route/companies"));

// Static
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port: ${process.env.PORT}`);
});
