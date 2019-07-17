const route = require("express").Router();

route.get("/", (req, res) => {
  res.render("main/index", { pageTitle: "Index - Page" });
});

route.get("/signup", (req, res) => {
  res.render("main/signup", { pageTitle: "Sign up - RateMe" });
});

route.get("/signin", (req, res) => {
  res.render("main/signin", { pageTitle: "Sign in - RateMe" });
});

module.exports = route;
