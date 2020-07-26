const { ReplyMessage, validate } = require("../models/replyMessage");
const { Message } = require("../models/message");
const express = require("express");
const router = express.Router();
const {
  createMessages,
  sendMessages,
  getPushToken,
} = require("../utils/expoPushNotifications");

const auth = require("../middleware/auth");
const paramsIdCheck = require("../middleware/paramsIdCheck");

router.get("/:parentMessageId", auth, paramsIdCheck, async (req, res) => {
  const messages = await ReplyMessage.find({
    parentMessage: req.params.parentMessageId,
  }).populate(["parentMessage", { path: "sendFrom", select: "-password" }]);

  return res.status(200).send(messages);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const parentMessage = await Message.findById(req.body.parentMessageId);
  if (!parentMessage) return res.status(400).send("Message not found");

  const sendFrom = req.user._id;
  const sendTo = req.body.userId;

  const replyMessage = new ReplyMessage({
    parentMessage: parentMessage._id,
    message: req.body.message,
    sendFrom,
  });

  await replyMessage.save();

  const pushToken = await getPushToken(sendTo);
  let messages = createMessages(
    {
      body: req.body.message,
    },
    {
      _displayInForeground: true,
    },
    pushToken,
    "messages"
  );
  await sendMessages(messages);

  return res.status(200).send(replyMessage);
});

module.exports = router;
