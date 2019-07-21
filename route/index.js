const route = require("express").Router();
const passport = require("passport");
const singupValidate = require("../middleware/auth/signupValidate");
const resetValidate = require("../middleware/auth/resetValidate");
const { check, validationResult } = require("express-validator");
const crypto = require("crypto");
const asyncPkg = require("async");
const User = require("../models/User");
const nodemailer = require("nodemailer");

route.get("/", (req, res) => {
  res.render("main/index", { pageTitle: "Index - Page" });
});

route.get("/signup", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
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
    successRedirect: "/signin"
  }),
  (req, res) => {}
);

route.get("/signin", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("main/signin", {
    pageTitle: "Sign in - RateMe",
    errors: req.flash("error"),
    success: req.flash("success")
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
    failureRedirect: "/signin"
  }),
  (req, res) => {
    if (req.body.remme) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      req.session.random = Math.random();
    } else {
      req.session.cookie.expires = null;
    }
    res.redirect("/");
  }
);

route.get("/signout", (req, res) => {
  req.logout();
  res.redirect("/signin");
});

route.get("/forget", (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
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
    failureRedirect: "/forget",
    failureFlash: true
  }),
  (req, res) => {
    asyncPkg.waterfall([
      callback => {
        crypto.randomBytes(128, (err, buffer) => {
          callback(err, buffer.toString("hex"));
        });
      },
      (buff, callback) => {
        User.findOneAndUpdate(
          { email: req.body.email },
          {
            $set: {
              passwordResetToken: buff,
              passwordResetExpiration: Date.now() + 60 * 60 * 1000
            }
          },
          {
            new: true,
            fields: {
              passwordResetToken: 1,
              passwordResetExpiration: 1,
              email: 1,
              username: 1
            }
          },
          (err, userRes) => {
            let transporter = nodemailer.createTransport({
              host: "smtp.gmail.com",
              port: 465,
              secure: true,
              auth: {
                user: process.env.G_USER,
                pass: process.env.G_PASS
              }
            });
            transporter
              .sendMail({
                from: `RateMe <${process.env.G_USER}>`,
                to: userRes.email,
                subject: "Password Reset.",
                html: `<strong>Hi ${
                  userRes.username
                },</strong> <br /> <p>You have requested for your password to be reset. Please click the <a href="http://localhost:5000/reset/${buff}">link</a> to set new password.</p> `
              })
              .then(emailStat => {
                req.flash(
                  "success",
                  "Success! Please check email to reset password."
                );
                return callback(err, emailStat);
              })
              .catch(err => {
                console.log(err);
              });
          }
        );
      },
      (err, user) => {
        res.redirect("/forget");
      }
    ]);
  }
);

route.get("/reset/:token", resetValidate, (req, res) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("main/reset", {
    pageTitle: "Reset Password - RateMe",
    email: req.temp.email,
    actionLink: `/reset/${req.params.token}`
  });
});

route.post(
  "/reset/:token",
  [
    check("password", "Password must be atleast 5 character.").isLength({
      min: 5
    })
  ],
  passport.authenticate("local.reset", {
    failureRedirect: "/signin",
    successRedirect: "/signin"
  }),
  (req, res) => {}
);

module.exports = route;
