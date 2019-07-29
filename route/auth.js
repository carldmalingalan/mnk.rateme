const passport = require("passport"),
  route = require("express").Router();

route.get(
  "/facebook",
  passport.authenticate("facebook-local", {
    scope: ["email", "public_profile"],
    auth_type: "rerequest"
  })
);

route.get(
  "/facebook/callback",
  passport.authenticate("facebook-local"),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = route;
