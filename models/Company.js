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
  },
  employees: [
    {
      id: { type: Schema.Types.ObjectId },
      rating: { type: Number },
      role: { type: String }
    }
  ],
  totalStars: { type: Number, default: 0 },
  totalRating: { type: Number, default: 0 }
});

CompanySchema.post("update", function(next) {
  console.log(this);
  next();
});

module.exports = Company = mongoose.model("companies", CompanySchema);
