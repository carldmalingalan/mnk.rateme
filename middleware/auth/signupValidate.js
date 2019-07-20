const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    req.flash("error", error.array().map(val => val.msg));
  }

  next();
};
