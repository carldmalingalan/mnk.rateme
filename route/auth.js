const passport = require("passport"),
  route = require("express").Router();

route.get("/facebook", passport.authenticate("facebook", { scope: "email" }));

module.exports = route;
