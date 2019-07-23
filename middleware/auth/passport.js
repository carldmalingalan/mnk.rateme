const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../../models/User");
const FBStrategy = require("passport-facebook").Strategy;

passport.serializeUser((user, done) => {
  if (!user) {
    return done(null, false);
  }

  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  if (!id) {
    return done(null, false);
  }

  User.findOne({ _id: id })
    .select("-password")
    .then(data => {
      done(null, data);
    })
    .catch(err => {
      done(err);
    });
});

passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    (req, email, pass, cb) => {
      const error = req.flash("error");
      if (error.length) {
        return cb(null, false, req.flash("error", error));
      }
      User.findOne({ email }, (err, user) => {
        if (err) {
          return cb(err);
        }
        if (user) {
          return cb(null, false, req.flash("error", "Email already exist!"));
        }

        const { username } = req.body;
        let newUser = User({ username, email, password: pass });
        newUser.save(err => {
          if (err) {
            return cb(err);
          }

          cb(null, newUser);
        });
      });
    }
  )
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    (req, email, pass, cb) => {
      User.findOne({ email }, (err, user) => {
        const error = req.flash("error");
        if (error.length) {
          return cb(null, false, req.flash("error", error));
        }
        if (err) {
          return cb(err);
        }
        if (!user) {
          return cb(null, false, req.flash("error", "User doens't exist."));
        }

        user.comparePass(pass).then(res => {
          if (!res) {
            return cb(
              null,
              false,
              req.flash("error", "Invalid Email/Password")
            );
          }
          return cb(null, user);
        });
      });
    }
  )
);

passport.use(
  "local.forget",
  new LocalStrategy(
    { usernameField: "email", passwordField: "email", passReqToCallback: true },
    (req, email, pass, done) => {
      const error = req.flash("error");
      if (error.length) {
        return done(null, false, req.flash("error", error));
      }

      User.findOne({ email }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, req.flash("error", "Email doesn't exist."));
        }

        return done(null, user);
      });
    }
  )
);

passport.use(
  "local.reset",
  new LocalStrategy(
    {
      usernameField: "password",
      passwordField: "password",
      passReqToCallback: true
    },
    (req, user, pass, done) => {
      const error = req.flash("error");
      if (error.length) {
        return done(null, false, req.flash("error", error));
      }

      User.findOne({ passwordResetToken: req.params.token })
        .select("-password")
        .then(retset => {
          if (Date.now() > new Date(retset.passwordResetExpiration)) {
            retset.passwordResetToken = "";
            retset.save();
            return done(
              null,
              false,
              req.flash(
                "error",
                "Sorry, the link your trying to access has expired."
              )
            );
          }

          retset.password = pass;
          retset.passwordResetToken = "";
          retset.passwordResetExpiration = Date.now();
          retset.save((errMsg, infoMsg) => {
            return done(
              errMsg,
              infoMsg,
              req.flash("success", "Success! You have reset your password.")
            );
          });
        })
        .catch(err => {
          return done(
            null,
            false,
            req.flash(
              "error",
              "Sorry, the link your trying to access is invalid."
            )
          );
        });
    }
  )
);

passport.use(
  "facebook-local",
  new FBStrategy(
    {
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: "http://localhost:5000/auth/facebook/callback",
      profileFields: ["id", "displayName", "email", "name"]
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ facebookID: profile.id }, "-password", (err, userData) => {
        if (err) {
          done(null, err);
        }
        if (userData) {
          return done(null, userData);
        }

        let newUser = new User({
          email: profile._json.email,
          username: profile.displayName,
          facebookID: profile.id
        });
        newUser.save(err => {
          if (err) {
            return done(null, err);
          }
          done(null, newUser);
        });
      });
    }
  )
);
