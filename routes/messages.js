const { Message, validate } = require("../models/message");
const { List } = require("../models/listing");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const {
  getPushTokens,
  createMessages,
  sendMessages,
  getPushToken,
} = require("../utils/expoPushNotifications");

const auth = require("../middleware/auth");
const paramsIdCheck = require("../middleware/paramsIdCheck");

router.get("/", auth, async (req, res) => {
  const messages = await Message.find().populate([
    { path: "sendFrom", select: "-password" },
    { path: "sendTo", select: "-password" },
  ]);

  return res.status(200).send(messages);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const listing = await List.findById(req.body.listingId);
  const sendTo = listing.user;
  const sendFrom = req.user._id;

  const message = new Message({
    title: listing.title,
    message: req.body.message,
    sendTo,
    sendFrom,
  });

  await message.save();

  const pushToken = await getPushToken(sendTo);
  let messages = createMessages(
    {
      title: listing.title,
      body: req.body.message,
    },
    {
      _displayInForeground: true,
    },
    pushToken,
    "messages"
  );
  await sendMessages(messages);

  return res.status(200).send(message);
});

router.get("/user/:sendTo/:sendFrom", auth, paramsIdCheck, async (req, res) => {
  const messages = await Message.find()
    .or([{ sendTo: req.params.sendTo }, { sendFrom: req.params.sendFrom }])
    .populate({
      path: "sendFrom",
      select: "-password",
    });

  return res.status(200).send(messages);
});

router.get("/:id", auth, paramsIdCheck, async (req, res) => {
  const message = await Message.findById(req.params.id).populate({
    path: "sendForm",
    select: "-password",
  });

  if (!message) return res.status(400).send("Message not found.");

  return res.status(200).send(message);
});

router.delete("/:id", auth, paramsIdCheck, async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) return res.status(400).send("No message found of this id.");

  await message.remove();

  return res.status(200).send(message);
});

router.get("/users/:title", auth, async (req, res) => {
  const messages = await Message.find({
    title: req.params.title,
  });

  return res.status(200).send(messages);
});

module.exports = router;
