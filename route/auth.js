const passport = require("passport"),
  route = require("express").Router();

route.get(
  "/facebook",
  passport.authenticate("facebook-local", {
    scope: ["email", "public_profile"],
    auth_type: "rerequest"
  })
);

route.post("/");
route.get(
  "/facebook/callback",
  passport.authenticate("facebook-local"),
  (req, res) => {
    console.log(req.user);
    res.redirect("/");
  }
);
module.exports = route;
