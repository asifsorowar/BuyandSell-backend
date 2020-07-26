const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const pushTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const PushToken = mongoose.model("PushToken", pushTokenSchema);

const validate = (pushToken) => {
  const schema = Joi.object({
    token: Joi.string().required(),
  });
  return schema.validate(pushToken);
};

module.exports.validate = validate;
module.exports.PushToken = PushToken;
