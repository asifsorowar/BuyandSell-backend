const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const express = require("express");
const fileUpload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

const error = require("../middleware/error");
const users = require("../routes/users");
const auth = require("../routes/auth");
const listings = require("../routes/listings");
const PushTokens = require("../routes/pushTokens");
const messages = require("../routes/messages");
const replyMessages = require("../routes/replyMessages");

module.exports = (app) => {
  app.use(express.static("public"));
  app.use(express.json());
  app.use(cookieParser());
  app.use(fileUpload());
  app.use(mongoSanitize());
  app.use(helmet());
  app.use(xss());
  app.use(hpp());
  app.use(cors());
  if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

  app.use("/api/listings", listings);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/pushTokens", PushTokens);
  app.use("/api/messages", messages);
  app.use("/api/replyMessages", replyMessages);
  app.use(error);
};
