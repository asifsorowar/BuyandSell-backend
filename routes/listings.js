const { validate, List } = require("../models/listing");
const path = require("path");
const cloudinary = require("../utils/imageUpload");
// const sharp = require("sharp");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const idCheck = require("../middleware/paramsIdCheck");

router.get("/", auth, async (req, res) => {
  const listings = await List.find({}).populate({
    path: "user",
    select: "-password",
  });
  return res.status(200).send(listings);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let files = req.files.images;
  let images = [];
  if (!Array.isArray(files)) images.push(files);
  if (Array.isArray(files)) images = [...files];

  for (let [index, image] of images.entries()) {
    if (!image.mimetype.startsWith("image"))
      return res.status(400).send("Please upload an image");

    if (image.size > process.env.PHOTO_SIZE)
      return res
        .status(400)
        .send(
          `Please upload an image within ${process.env.PHOTO_SIZE / 1000000}Mb`
        );

    const randomValue = Math.random().toString(36).substring(7);
    image.name = `listing_${req.user._id}_${randomValue}_${index}${
      path.parse(image.name).ext
    }`;

    await image.mv(`${process.env.LISTING_IMAGE_PATH}/${image.name}`);

    // await cloudinary.uploader.upload(
    //   `${process.env.LISTING_IMAGE_PATH}/${image.name}`,
    //   {
    //     folder: "Listings",
    //     public_id: image.name,
    //     // transformation: [
    //     //   { width: 1000, height: 1000, gravity: "face", crop: "thumb" },
    //     // ],
    //   }
    // );

    // await sharp(image.data)
    //   .resize(1000, 1000)
    //   .toFile(`${process.env.LISTING_IMAGE_PATH}/thumb_${image.name}`);
  }

  const imageUrls = images.map((image) => ({
    url: `${req.protocol}://${req.get("host")}/listing_image/${image.name}`,
  }));

  let location = undefined;
  if (req.body.location) {
    location = JSON.parse(req.body.location);
  }

  const listing = new List({
    title: req.body.title,
    price: req.body.price,
    category: req.body.category,
    description: req.body.description,
    images: imageUrls,
    location: location,
    user: req.user._id,
  });

  await listing.save();

  return res.send(listing);
});

router.get("/:id", auth, idCheck, async (req, res) => {
  const list = await List.findById(req.params.id).populate({
    path: "user",
    select: "-password",
  });
  if (!list) return res.status(400).send("No listing found of this id.");
  return res.status(200).send(list);
});

router.get("/user/:userId", auth, idCheck, async (req, res) => {
  const listings = await List.find({ user: req.params.userId }).populate({
    path: "user",
    select: "-password",
  });

  return res.status(200).send(listings);
});

module.exports = router;
