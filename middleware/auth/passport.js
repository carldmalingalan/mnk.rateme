const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../../models/User");

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
        return cb(null, false, req.flash("error", error));
      }

      User.findOne({ email }, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false, req.flash("error", "Email doesn't exist."));
        }

        return done(
          null,
          user,
          req.flash("success", "Check email to reset password.")
        );
      });
    }
  )
);
