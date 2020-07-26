const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    uppercase: true,
  },
  lastName: {
    type: String,
    uppercase: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  photo: {
    type: String,
    default: "nophoto.png",
    required: true,
  },
});

userSchema.methods.getJwtToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      photo: this.photo,
    },
    process.env.JWT_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );

  return token;
};

userSchema.methods.getCookieOptions = function () {
  return {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPRIE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

const User = mongoose.model("User", userSchema);

const validate = (user) => {
  const schema = Joi.object({
    firstName: Joi.string()
      .required()
      .regex(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/)
      .message("First name Only words characters allowed"),
    lastName: Joi.string()
      .required()
      .regex(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/)
      .message("Last name Only words characters allowed"),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(5),
  });

  return schema.validate(user);
};

module.exports.validate = validate;
module.exports.User = User;
module.exports.userSchema = userSchema;
