const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const SaltCount = parseInt(process.env.SALT_ITER);

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date_created: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre("save", function(next) {
  if (!this.isModified("password")) return next();

  bcrypt.genSalt(SaltCount, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(this.password, salt, (err, hashed) => {
      if (err) {
        return next(err);
      }
      this.password = hashed;
      next();
    });
  });
});

UserSchema.methods.comparePass = function(rawPass) {
  return bcrypt.compare(rawPass, this.password);
};

module.exports = User = mongoose.model("users", UserSchema);
