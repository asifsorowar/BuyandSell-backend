const path = require("path");
const _ = require("lodash");
const { validate, User } = require("../models/user");
const auth = require("../middleware/auth");
const express = require("express");
const Joi = require("@hapi/joi");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate(["department", "batch"])
    .select("-password");
  return res.status(200).send(user);
});

router.put("/me/update", auth, async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id).select("-password");

  if (req.files.image) {
    const file = req.files.image;
    if (!file.mimetype.startsWith("image"))
      return res.status(400).send("Please upload an image");
    if (file.size > process.env.PHOTO_SIZE)
      return res
        .status(400)
        .send(
          `Please upload a photo less than ${
            process.env.PHOTO_SIZE / 1000000
          }Mb.`
        );
    file.name = `photo_${user._id}${path.parse(file.name).ext}`;
    await file.mv(`${process.env.PHOTO_UPLOAD_PATH}/${file.name}`);
    await User.findByIdAndUpdate(user._id, {
      $set: {
        photo: file.name,
      },
    });
  }

  await User.findByIdAndUpdate(user._id, {
    $set: {
      firstName: req.files.firstName,
      lastName: req.files.lastName,
    },
  });

  res
    .status(200)
    .send(_.pick(user, ["_id", "firstName", "lastName", "email", "photo"]));
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({
    email: req.body.email,
  });
  if (user) return res.status(400).send("email already taken");

  user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  await user.save();

  const token = user.getJwtToken();
  const options = user.getCookieOptions();

  return res
    .status(200)
    .cookie("token", token, options)
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "firstName", "lastName", "email", "photo"]));
});

const validateUpdate = (user) => {
  const schema = Joi.object({
    firstName: Joi.string()
      .required()
      .regex(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/)
      .message("First name Only words characters allowed"),
    lastName: Joi.string()
      .required()
      .regex(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{2,}$/)
      .message("Last name Only words characters allowed"),
  });
  return schema.validate(user);
};

module.exports = router;
