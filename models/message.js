const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const messageSchema = new mongoose.Schema({
  title: {
    type: String,
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
  sendTo: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, default: Date.now },
});

messageSchema.pre("remove", async function (req, res, next) {
  await this.model("ReplyMessage").deleteMany({ parentMessage: this._id });
  return next();
});

const Message = mongoose.model("Message", messageSchema);

const validate = (message) => {
  const schema = Joi.object({
    message: Joi.string().required().min(1),
    listingId: Joi.objectId().required(),
  });
  return schema.validate(message);
};

module.exports.validate = validate;
module.exports.Message = Message;
