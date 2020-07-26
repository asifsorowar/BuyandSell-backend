const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: String,

  images: {
    type: Array,
    required: true,
  },
  location: {
    type: Object,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

const List = mongoose.model("List", listSchema);

const validate = (list) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    category: Joi.string().required(),
    description: Joi.string(),
    location: Joi.string(),
  });

  return schema.validate(list);
};

module.exports.List = List;
module.exports.validate = validate;
