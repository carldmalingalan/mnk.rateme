const route = require("express").Router();
const path = require("path");
const fs = require("fs");
const Company = require("../models/Company");
const uuid = require("uuid");
const multer = require("multer");

// Custom File Upload - Custom Middleware
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../public/image/upload"),
  filename: (req, file, cb) => {
    return cb(null, file.originalname);
  }
});

const upload = require("multer")({
  storage,
  fileFilter: (req, file, cb) => {
    const fileName = `${uuid.v4()}${path.extname(file.originalname)}`;
    const { name } = req.body;
    Company.findOne({ name }, (err, user) => {
      if (err) {
        req.flash("error", "Something went wrong.");
        return cb(null, false);
      }
      if (user) {
        req.flash("error", "Company already exist.");
        return cb(null, false);
      }
      let newComp = new Company({
        ...req.body,
        imagePath: path.join("image/upload", fileName)
      });
      newComp.save(err => {
        if (err) {
          req.flash("error", "Something went wrong.");
          return cb(null, false);
        }
        cb(null, true);
        fs.rename(
          path.join(__dirname, `../public/image/upload/${file.originalname}`),
          path.join(__dirname, `../public/image/upload/${fileName}`),
          err => {
            if (err) {
              return cb(null, false);
            }
            req.flash("success", "Company successfull created.");
          }
        );
      });
    });
  }
}).single("company_image");

route
  .route("/add")
  .get((req, res) => {
    res.render("companies/addCompany", {
      pageTitle: "Company Add - MNK Rate Me",
      user: req.user,
      errors: req.flash("error"),
      success: req.flash("success")
    });
  })
  .post(upload, (req, res) => {
    res.redirect("/company/add");
  });

route.route("/profile/:id").get((req, res) => {
  const { id } = req.params;
  Company.findOne({ _id: id }, (err, comp) => {
    if (err || !comp) {
      return res.redirect("/");
    }
    res.render("companies/profileComp", {
      pageTitle: "Profile - MNK Rate Me",
      user: req.user,
      errors: req.flash("error"),
      success: req.flash("success"),
      comp
    });
  });
});

route.route("/").get(async (req, res) => {
  console.log(req.params);
  let companies = await Company.find();
  res.render("companies/index", {
    pageTitle: "Companies - RateMe",
    success: req.flash("success"),
    errors: req.flash("error"),
    user: req.user,
    comps: companies
  });
});

module.exports = route;
