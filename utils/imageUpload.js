require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.IMAGE_CLOUD_NAME,
  api_key: process.env.IMAGE_CLOUD_API,
  api_secret: process.env.IMAGE_CLOUD_API_SECRET,
});

module.exports = cloudinary;
