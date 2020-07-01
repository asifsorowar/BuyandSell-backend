const { User } = require("../models/user");

const bcrypt = require("bcrypt");
const Joi = require("@hapi/joi");
const _ = require("lodash");

const express = require("express");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("email or password invalid");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("email or password invalid");

  const token = user.getJwtToken();
  const options = user.getCookieOptions();

  return res.status(200).cookie("token", token, options).send(token);
});

router.get("/logout", async (req, res) => {
  return res
    .cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })
    .send({});
});

const validateLogin = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(user);
};

module.exports = router;
