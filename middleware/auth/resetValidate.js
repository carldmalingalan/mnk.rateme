const User = require("../../models/User");

module.exports = (req, res, next) => {
  User.findOne({ passwordResetToken: req.params.token })
    .select("-password")
    .then(data => {
      if (!data) {
        req.flash(
          "error",
          "Sorry, The link you're trying to access is invalid."
        );
        res.redirect("/signin");
        return next();
      }
      req.temp = data;

      return next();
    })
    .catch(err => {
      res.redirect("/signin");
      next();
    });
};
