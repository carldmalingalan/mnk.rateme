const route = require("express").Router();
const passport = require("passport");
const singupValidate = require("../middleware/auth/signupValidate");
const { check, validationResult } = require("express-validator");

route.get("/", (req, res) => {
  res.render("main/index", { pageTitle: "Index - Page" });
});

route.get("/signup", (req, res) => {
  res.render("main/signup", {
    pageTitle: "Sign up - RateMe",
    errors: req.flash("error")
  });
});

route.post(
  "/signup",
  [
    check("username", "Username is empty.")
      .not()
      .isEmpty(),
    check("email", "Email is empty.")
      .not()
      .isEmpty(),
    check("email", "Email is invalid.").isEmail(),
    check("password", "Password must be atleast 5 characters.").isLength({
      min: 5
    })
  ],
  singupValidate,
  passport.authenticate("local.signup", {
    failureRedirect: "/signup",
    successRedirect: "/"
  }),
  (req, res) => {}
);

route.get("/signin", (req, res) => {
  res.render("main/signin", {
    pageTitle: "Sign in - RateMe",
    errors: req.flash("error")
  });
});

route.post(
  "/signin",
  [
    check("email", "Email is empty.")
      .not()
      .isEmpty(),
    check("email", "Email is invalid.").isEmail(),
    check("password", "Password must be atleast 5 characters.").isLength({
      min: 5
    })
  ],
  singupValidate,
  passport.authenticate("local.signin", {
    successRedirect: "/",
    failureRedirect: "/signin"
  }),
  (req, res) => {}
);

route.get("/forget", (req, res) => {
  res.render("main/forget", {
    pageTitle: "Reset Password - RateMe",
    errors: req.flash("error"),
    success: req.flash("success")
  });
});

route.post(
  "/forget",
  [check("email", "Email is invalid.").isEmail()],
  (req, res, next) => {
    if (!validationResult(req).isEmpty()) {
      req.flash(
        "error",
        validationResult(req)
          .array()
          .map(val => val.msg)
      );
      return next();
    }
    next();
  },
  passport.authenticate("local.forget", {
    successRedirect: "/forget",
    failureRedirect: "/forget",
    failureFlash: true
  }),
  (req, res) => {}
);

module.exports = route;
