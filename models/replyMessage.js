const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const replyMessageSchema = new mongoose.Schema({
  parentMessage: {
    type: mongoose.Schema.ObjectId,
    ref: "Message",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sendFrom: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
});

const ReplyMessage = mongoose.model("ReplyMessage", replyMessageSchema);

const validate = (replyMessage) => {
  const schema = Joi.object({
    userId: Joi.objectId().required(),
    message: Joi.string().required().min(1),
    parentMessageId: Joi.objectId().required(),
  });
  return schema.validate(replyMessage);
};

module.exports.validate = validate;
module.exports.ReplyMessage = ReplyMessage;
