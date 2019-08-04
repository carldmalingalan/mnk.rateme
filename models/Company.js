const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String
  },
  country: {
    type: String,
    required: true
  },
  sector: {
    type: String
  },
  website: {
    type: String
  },
  imagePath: {
    type: String
  }
});

module.exports = Company = mongoose.model("companies", CompanySchema);
