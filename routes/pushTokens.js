const { validate, PushToken } = require("../models/pushToken");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const tokens = await PushToken.find({}).populate({
    path: "user",
    select: "-password",
  });
  return res.status(200).send(tokens);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const existToken = await PushToken.find({ token: req.body.token });
  if (existToken) return res.status(400).send("Token already existed.");

  const pushToken = new PushToken({
    user: req.user._id,
    token: req.body.token,
  });

  await pushToken.save();

  return res.status(201).send(pushToken);
});

module.exports = router;
